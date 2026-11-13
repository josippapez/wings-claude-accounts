#!/bin/sh
# Builds each frame the manifest names as a .wasm (its main, its sidebar and its popover) from the crate in rust/ with
# the feature of that frame's name, into dist/native/<frame>.wasm. The output is committed, because Wings installs a
# plugin folder straight from the default branch.
#   sh build.sh          build every frame
#   sh build.sh --check  fail if a committed module differs from what rust/ builds
# Needs the target: rustup target add wasm32-unknown-unknown.
set -eu
cd "$(dirname "$0")"
check=""
[ "${1:-}" = --check ] && check=1
stale=0
frames=$(jq -r '[.main, (.contributes | (.sidebars[]? | .page, .popover.page?), .views[]?.page, .blocks[]?.page, .settings?.page?)] | .[] | select(type == "string" and endswith(".wasm"))' wings-plugin.json)
for frame in $frames; do
  name=$(basename "$frame" .wasm)
  cargo build --quiet --release --target wasm32-unknown-unknown --manifest-path rust/Cargo.toml --features "$name"
  built=rust/target/wasm32-unknown-unknown/release/claude_accounts.wasm
  if [ -n "$check" ]; then
    cmp -s "$built" "$frame" || { echo "$frame is out of date. Run \`sh build.sh\` and commit it." >&2; stale=1; }
  else
    mkdir -p "$(dirname "$frame")"
    cp "$built" "$frame"
    echo "$frame  $(($(wc -c < "$frame") / 1024)) KB"
  fi
done
exit "$stale"
