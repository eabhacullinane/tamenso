#!/usr/bin/env python3
"""Build the Táménso site.

Edit the words in src/content/<lang>.json and the layout in src/template.html,
then run:   python3 build.py
It writes index.html (English), it/index.html and fr/index.html.
No dependencies: plain Python 3. Commit the generated files; GitHub Pages serves them.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
TEMPLATE = (ROOT / "src" / "template.html").read_text(encoding="utf-8")
LANGS = ["en", "it", "fr"]
RAW_KEYS = {"lang", "path"}  # inserted as-is


def render(lang: str) -> str:
    content = json.loads((ROOT / "src" / "content" / f"{lang}.json").read_text(encoding="utf-8"))
    for code in LANGS:
        content[f"cur.{code}"] = 'aria-current="page"' if code == lang else ""

    def sub(match: re.Match) -> str:
        key = match.group(1)
        if key not in content:
            raise KeyError(f"[{lang}] missing text for {{{{{key}}}}}")
        value = content[key]
        if key in RAW_KEYS or key.startswith("cur."):
            return value
        return html.escape(value, quote=True)

    return re.sub(r"\{\{\s*([\w.]+)\s*\}\}", sub, TEMPLATE)


def main() -> None:
    for lang in LANGS:
        out = ROOT / ("index.html" if lang == "en" else f"{lang}/index.html")
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(render(lang), encoding="utf-8")
        print("built", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
