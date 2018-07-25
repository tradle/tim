#!/bin/sh

GRADLE_PROPERTIES_FILE="android/gradle.properties"

function getProperty {
  PROP_KEY=$1
  PROP_VALUE=`cat $GRADLE_PROPERTIES_FILE | grep "$PROP_KEY" | cut -d'=' -f2`
  echo $PROP_VALUE
}

MAJOR=$(getProperty "VERSION_MAJOR")
MINOR=$(getProperty "VERSION_MINOR")
PATCH=$(getProperty "VERSION_PATCH")
# BUILD=$(getProperty "VERSION_BUILD")
VERSION="$MAJOR.$MINOR.$PATCH"

# cd android && ./gradlew clean && ./gradlew assembleRelease && cd $OLDPWD

DEST="android/app/build/intermediates/assets/release"
# RESOURCES="android/app/build/intermediates/res/merged/release/drawable*"

gitHash=$(git rev-parse HEAD)
RELEASES_DIR="release/android/"
THIS_RELEASE_DIR="$RELEASES_DIR/$VERSION/${gitHash:0:6}"

mkdir -p "$THIS_RELEASE_DIR"
react-native bundle \
  --platform android \
  --entry-file index.android.js \
  --bundle-output "$THIS_RELEASE_DIR/main.jsbundle" \
  --assets-dest "$THIS_RELEASE_DIR" \
  --dev false

# cp -a "$DEST/." "$THIS_RELEASE_DIR/"
# cp -r "$RESOURCES" "$THIS_RELEASE_DIR/"
