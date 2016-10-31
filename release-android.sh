#!/bin/sh

cd android && ./gradlew clean && ./gradlew assembleRelease && cd $OLDPWD

DEST="android/app/build/intermediates/assets/release"

gitHash=$(git rev-parse HEAD)
RELEASES_DIR="release/android/"
THIS_RELEASE_DIR="$RELEASES_DIR/${gitHash:0:10}"

mkdir -p "$THIS_RELEASE_DIR"
cp -a "$DEST/." "$THIS_RELEASE_DIR/"
