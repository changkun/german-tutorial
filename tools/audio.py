# /// script
# requires-python = ">=3.10"
# dependencies = ["lameenc==1.8.1"]
# ///
"""Synthesize the German audio the site plays next to each sentence.

Usage: OPENAI_API_KEY=… uv run tools/audio.py           synthesize what the last build asked for
       OPENAI_API_KEY=… uv run tools/audio.py --recheck redo clips that did not check out
       OPENAI_API_KEY=… uv run tools/audio.py --say "Hallo!" -o hallo.mp3

The site build (site/build.mjs) writes .audio/wanted.json, a list of
{"id", "text"}; this script turns every text without a file yet into
.audio/<id>.mp3, and the next build copies those files into the site.
The voice is OpenAI's text-to-speech with the model, voice and
instructions in site/audio.json; single words get their own instructions.

The voice does not always sound German: now and then a phrase comes out
with an English accent, and another try of the same text is usually fine.
So every clip is transcribed back as German and
compared with its text; a clip that does not come back letter for letter is
made again, up to TRIES times, and the best try is kept. The scores go to
.audio/scores.json, and --recheck retries the clips that scored below 1.
A transcriber often mishears a word said on its own, so single words may
keep a score below 1 although they sound right.
"""
import argparse, concurrent.futures, difflib, json, os, re, sys, threading, time, urllib.error, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".audio"
CONFIG = json.loads((ROOT / "site/audio.json").read_text())
KEY = os.environ.get("OPENAI_API_KEY")
TRIES = 4


def api(path, body, content_type):
    """POST to the OpenAI API, retrying when rate-limited or the server fails."""
    for attempt in range(6):
        req = urllib.request.Request(f"https://api.openai.com/v1/{path}", body, {
            "Authorization": f"Bearer {KEY}", "Content-Type": content_type})
        try:
            return urllib.request.urlopen(req, timeout=120).read()
        except urllib.error.HTTPError as e:
            if e.code != 429 and e.code < 500:
                sys.exit(f"{e.code} {e.read().decode()[:300]}")
        except (urllib.error.URLError, TimeoutError):
            pass
        time.sleep(2 ** attempt)
    sys.exit(f"gave up on {path}")


def mp3(text):
    """One try at text, as 48 kbps MP3."""
    word = re.fullmatch(r"[^\W\d_]+", text) is not None
    pcm = api("audio/speech", json.dumps({
        "model": CONFIG["model"],
        "voice": CONFIG["voice"],
        # A bare word reads more reliably as an utterance of its own: Haus.
        "input": text[0].upper() + text[1:] + "." if word else text,
        "instructions": CONFIG["word_instructions" if word else "instructions"],
        "response_format": "pcm",
    }).encode(), "application/json")
    import lameenc
    enc = lameenc.Encoder()
    enc.set_bit_rate(48)
    enc.set_in_sample_rate(24000)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pcm) + enc.flush()


def heard(clip):
    """What a German transcriber hears in clip."""
    b = "----german-tutorial"
    field = lambda name, value: f"--{b}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n"
    body = (field("model", "gpt-4o-transcribe") + field("language", "de") +
            f"--{b}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"clip.mp3\"\r\n"
            "Content-Type: audio/mpeg\r\n\r\n").encode() + clip + f"\r\n--{b}--\r\n".encode()
    return json.loads(api("audio/transcriptions", body, f"multipart/form-data; boundary={b}"))["text"]


def score(text, said):
    """1 when said has the letters of text, less the more they differ. Spaces
    do not count, and ß counts as ss, which a transcriber may write instead."""
    letters = lambda s: "".join(re.findall(r"[a-zäöüé0-9]+", s.lower().replace("ß", "ss")))
    return round(difflib.SequenceMatcher(None, letters(text), letters(said)).ratio(), 3)


def best(text, kept=None):
    """The best of up to TRIES clips of text, starting from a kept one."""
    for _ in range(TRIES):
        clip = mp3(text)
        said = heard(clip)
        s = score(text, said)
        if kept is None or s > kept["score"]:
            kept = {"clip": clip, "heard": said, "score": s}
        if s == 1:
            break
    return kept


def write(path, data):
    tmp = path.with_suffix(".part")
    tmp.write_bytes(data)
    tmp.rename(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--say")
    ap.add_argument("-o", "--out")
    ap.add_argument("--recheck", action="store_true")
    args = ap.parse_args()
    if args.say:
        if not KEY:
            sys.exit("set OPENAI_API_KEY")
        Path(args.out).write_bytes(best(args.say)["clip"])
        return

    wanted = json.loads((CACHE / "wanted.json").read_text())
    scores_file = CACHE / "scores.json"
    scores = json.loads(scores_file.read_text()) if scores_file.exists() else {}
    have = lambda w: (CACHE / f"{w['id']}.mp3").exists()
    todo = [w for w in wanted if not have(w) or (args.recheck and scores.get(w["id"], {}).get("score", 0) < 1)]
    if todo and not KEY:
        sys.exit(f"set OPENAI_API_KEY ({len(todo)} texts lack audio)")

    lock = threading.Lock()
    def one(w):
        path = CACHE / f"{w['id']}.mp3"
        kept = None
        if path.exists():
            old = scores.get(w["id"]) or {"heard": heard(path.read_bytes())}
            kept = {"clip": None, "heard": old["heard"], "score": score(w["text"], old["heard"])}
        if kept is None or kept["score"] < 1:
            kept = best(w["text"], kept)
        if kept["clip"]:
            write(path, kept["clip"])
        with lock:
            scores[w["id"]] = {"text": w["text"], "heard": kept["heard"], "score": kept["score"]}

    def save():
        with lock:
            write(scores_file, json.dumps(scores, ensure_ascii=False, indent=0).encode())

    with concurrent.futures.ThreadPoolExecutor(12) as pool:
        for i, _ in enumerate(pool.map(one, todo), 1):
            if i % 100 == 0 or i == len(todo):
                save()
                print(f"{i}/{len(todo)}", file=sys.stderr)
    low = [scores[w["id"]] for w in wanted if scores.get(w["id"], {}).get("score", 1) < 1]
    print(f"{len(wanted)} texts, {len(todo)} done; {len(low)} still not heard letter for letter", file=sys.stderr)


if __name__ == "__main__":
    main()
