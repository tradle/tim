#!/bin/sh

if [ "$1" != "ios" ] && [ "$1" != "android" ]; then
  echo "first argument must be platform: ios or android"
  exit 1
fi

PLATFORM="$1"
DEST="$2"
VERSION="$(./get-version.js $PLATFORM)"

if [ -z "$2" ]; then
  COMMIT_HASH=$(git rev-parse HEAD)
  DEST="release/$PLATFORM/$VERSION/${COMMIT_HASH:0:7}"
fi

./hooks/update_version.sh # update version.json

mkdir -p "$DEST"
DEV=false
if [ "$3" == true ]; then
  DEV=true
  echo "building in dev mode"
fi

ENTRY_FILE="index.$PLATFORM.js"
BUNDLE_FILE="$DEST/main.jsbundle"

echo "writing bundle and assets to $DEST"
react-native bundle \
  --entry-file "$ENTRY_FILE" \
  --platform "$PLATFORM" \
  --reset-cache \
  --dev $DEV \
  --bundle-output "$BUNDLE_FILE" \
  --sourcemap-output "$BUNDLE_FILE.map" \
  --assets-dest "$DEST"

