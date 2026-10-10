#!/usr/bin/env python3
"""Static checks for the published skills. Exits 0 when every check passes."""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / "skills"

FORBIDDEN = re.compile(
    r"/Users/|/home/[A-Za-z0-9._-]+/|\\\\Users\\\\|Documents[/\\\\]product|did:plc|"
    r"this Mac|this machine",
    re.I,
)

REQUIRED = {
    "launch-video-method": [
        "timing diagram",
        "Do not draw",
        "Beat map",
        "one true sentence",
        "failure first",
        "rejected, then accepted",
        "type alone",
        "Three layers",
        "Portals do not render",
        "dark pixels",
        "cropdetect",
        "Hiragino",
        "15 frames",
        "placeholders",
        "I made",
        "real product output",
        "remove before adding",
        "Who checks first?",
        "preflight__check_entry",
        "primaryBylineId",
        "PREFLIGHT_OFFSET",
        "dialogVariants",
        "type only",
        "Noto Sans JP",
        "BlockRenderer",
        "0.1.1",
        "orange",
        "Do not reuse",
        "toMatchFileSnapshot",
        "createPluginRuntimeTestHost",
        "1620",
        "English",
        "1.9",
        "wildflowers",
    ],
}


def frontmatter(text: str) -> str:
    if not text.startswith("---\n"):
        raise ValueError("missing frontmatter")
    end = text.find("\n---\n", 4)
    if end < 0:
        raise ValueError("unclosed frontmatter")
    return text[4:end]


def main() -> int:
    failures = []
    for name, needles in REQUIRED.items():
        skill = SKILLS / name
        skill_md = (skill / "SKILL.md").read_text(encoding="utf-8")
        body = "\n".join(path.read_text(encoding="utf-8") for path in sorted(skill.glob("*.md")))
        meta = frontmatter(skill_md)
        if f"name: {name}" not in meta:
            failures.append(f"{name}: name does not match directory")
        if "license: MIT" not in meta:
            failures.append(f"{name}: license is not MIT")
        if 'version: "0.2.2"' not in meta:
            failures.append(f"{name}: metadata.version is not 0.2.2")
        hit = FORBIDDEN.search(body)
        if hit:
            failures.append(f"{name}: forbidden text {hit.group()!r}")
        for needle in needles:
            if needle not in body:
                failures.append(f"{name}: missing {needle!r}")
    plugin = (ROOT / ".claude-plugin" / "plugin.json").read_text(encoding="utf-8")
    if '"version": "0.2.2"' not in plugin:
        failures.append("plugin.json version is not 0.2.2")
    if '"skills": "./skills/"' not in plugin:
        failures.append('plugin.json must set "skills": "./skills/"')
    logo = ROOT / "assets" / "logo.png"
    if not logo.is_file() or logo.stat().st_size < 1000:
        failures.append("assets/logo.png missing")
    else:
        data = logo.read_bytes()
        if data[25] != 6:
            failures.append("assets/logo.png is not RGBA (color type 6)")
    if failures:
        print(f"{len(failures)} failed")
        for item in failures:
            print(f"  - {item}")
        return 1
    print(f"ok: {len(REQUIRED)} skills, logo alpha, plugin skills path")
    return 0


if __name__ == "__main__":
    sys.exit(main())
