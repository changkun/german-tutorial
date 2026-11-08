"""Repo-wide structural lint for the German tutorial."""
import os, re, sys
root = sys.argv[1]
bad = 0
def report(msg):
    global bad; bad += 1; print(msg)
skip = (".git", "node_modules", "_site", ".audio")
files = [os.path.join(dp, f) for dp, _, fs in os.walk(root)
         if not any(part in skip for part in os.path.relpath(dp, root).split(os.sep)) for f in fs if f.endswith(".md")]
for p in sorted(files):
    rel = os.path.relpath(p, root)
    s = open(p).read()
    for m in re.finditer(r"\]\(([^)#\s]+)(#[^)]*)?\)", s):
        t = m.group(1)
        if t.startswith(("http", "mailto:")):
            continue
        if not os.path.exists(os.path.normpath(os.path.join(os.path.dirname(p), t))):
            report(f"{rel}: broken link {t}")
    for w in ["待补充", "TBD", "瑞典语", "Swedish"]:
        if w in s:
            report(f"{rel}: contains {w!r}")
    if s.count("<details>") != s.count("</details>"):
        report(f"{rel}: unbalanced <details>")
    if rel.startswith("grammar/") and rel != "grammar/end.md":
        for h in ["## 总结", "## 练习", "<summary>答案</summary>"]:
            if h not in s:
                report(f"{rel}: missing {h}")
    last = s.rstrip().splitlines()[-1] if s.strip() else ""
    if rel != "README.md" and "返回目录" not in last:
        report(f"{rel}: last line is not a nav line")
    if s.count("```") % 2:
        report(f"{rel}: unbalanced code fence")
print(f"-- {bad} problem(s) in {len(files)} files")
