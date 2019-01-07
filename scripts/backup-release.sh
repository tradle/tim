#!/bin/bash

set -x
set -euo pipefail

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
source "$SCRIPTS_DIR/env.sh"

BUCKET="tradle-app-releases"
APP_NAME="Tradle"
PLATFORM="$1"
RELEASE_TYPE="$2"
VERSION="$3"
APK_DIR=${4-""}
BUILD_PATH="$PLATFORM"

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

cd "$SCRIPTS_DIR/../"

echo "backing up $RELEASE_TYPE version $VERSION to $TARGET_FOLDER"

if [[ "$PLATFORM" == "ios" ]]
then
  aws s3 cp "$BUILD_PATH/$APP_NAME.ipa" "s3://$TARGET_FOLDER/"
  aws s3 cp "$BUILD_PATH/$APP_NAME.app.dSYM.zip" "s3://$TARGET_FOLDER/"
elif [[ "$PLATFORM" == "android" ]]
then
  if [[ ! "$APK_DIR" ]]
  then
    echo "expected 4th argument to be path to apk dir"
    exit 1
  fi

  aws s3 cp --recursive --exclude "*" --include "app-*-release*.apk" "$APK_DIR" "s3://$TARGET_FOLDER/"
fi
