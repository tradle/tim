#!/bin/bash

set -x
set -euo pipefail

BUCKET="tradle-app-releases"
APP_NAME="Tradle"
PLATFORM="$1"
RELEASE_TYPE="$2"
VERSION="$3"
APK_PATH="$4"
BUILD_PATH="$(dirname $0)/../$PLATFORM"

if [[ "$PLATFORM" != "ios" ]] && [[ "$PLATFORM" != "android" ]];
then
  echo "expected 1st argument to be 'ios' or 'android'"
  exit 1
fi

if [[ ! "$RELEASE_TYPE" ]];
then
  echo "expected 2nd argument to be release type, e.g. 'Release' or 'Staging' for ios or 'internal', 'production', etc. for android"
  exit 1
fi

if [[ ! "$VERSION" ]];
then
  echo "expected 3rd argument to be version string"
  exit 1
fi

TARGET_FOLDER="$BUCKET/$PLATFORM/$RELEASE_TYPE/$VERSION"

echo "backing up $RELEASE_TYPE version $VERSION to $TARGET_FOLDER"

if [[ "$PLATFORM" == "ios" ]]
then
  aws s3 cp "$BUILD_PATH/$APP_NAME.ipa" "s3://$TARGET_FOLDER/"
  aws s3 cp "$BUILD_PATH/$APP_NAME.app.dSYM.zip" "s3://$TARGET_FOLDER/"
elif [[ "$PLATFORM" == "android" ]]
then
  if [[ ! "$APK_PATH" ]]
  then
    echo "expected 4th argument to be path to apk"
    exit 1
  fi

  aws s3 cp "$APK_PATH" "s3://$TARGET_FOLDER/"
fi
