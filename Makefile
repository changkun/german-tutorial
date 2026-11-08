# Build, preview, check, and publish the reading site.
#   make build     build _site/
#   make dev       rebuild on change and serve at http://localhost:4411
#   make check     build, then load every page in Chrome and report console
#                  errors, broken links, overflow, and header problems
#   make audio     synthesize the audio the pages ask for that is not in
#                  .audio/ yet (needs uv and OPENAI_API_KEY; see tools/audio.py)
#   make lint      check links, nav lines, summaries and exercises
#   make deploy    audio, check, and publish to https://changkun.de/german-tutorial/

HOST ?= changkunde
DEST ?= /www/changkun.de/german-tutorial/

build:
	node site/build.mjs

dev:
	node site/dev.mjs

check: build
	node site/check.mjs

audio: build
	uv run tools/audio.py
	node site/build.mjs

lint:
	python3 tools/lint.py .

deploy: audio check
	rsync -az --delete _site/ $(HOST):$(DEST)
	@echo "published to https://changkun.de/german-tutorial/"

.PHONY: build dev check audio lint deploy
