#!/bin/sh
# Copy the skills into a user skills directory. Re-run to update.
set -eu
root=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
if [ "$#" -ne 1 ]; then
  echo "usage: scripts/install.sh all|cursor|claude|codex|DEST" >&2
  exit 2
fi

copy_into() {
  dest=$1
  mkdir -p "$dest"
  for name in launch-video-method remotion-launch-video; do
    rm -rf "$dest/$name"
    cp -R "$root/skills/$name" "$dest/$name"
  done
  printf '%s\n' "0.1.0" > "$dest/.launch-video-skills-version"
  echo "Installed 0.1.0 into $dest"
}

case "$1" in
  all)
    copy_into "${HOME}/.cursor/skills"
    copy_into "${HOME}/.claude/skills"
    copy_into "${HOME}/.agents/skills"
    ;;
  cursor) copy_into "${HOME}/.cursor/skills" ;;
  claude) copy_into "${HOME}/.claude/skills" ;;
  codex) copy_into "${HOME}/.agents/skills" ;;
  *) copy_into "$1" ;;
esac
