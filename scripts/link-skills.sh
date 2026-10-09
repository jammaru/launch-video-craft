#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
for dir in .agents/skills .claude/skills .cursor/skills .github/skills; do
  mkdir -p "$dir"
  for name in launch-video-method remotion-launch-video; do
    ln -sfn "../../skills/$name" "$dir/$name"
  done
done
echo "Linked skills/ into .agents, .claude, .cursor, and .github."
