#!/bin/bash

set -x
set -euo pipefail

BUCKET="tradle-app-releases"
APP_NAME="Tradle"
PLATFORM="ios"
SCHEME="$1"
VERSION="$2"
BUILD_PATH="$(dirname $0)/../ios"

if [[ "$SCHEME" != "Release" ]] && [[ "$SCHEME" != "Staging" ]];
then
  echo "expected scheme to be Release or Staging"
  exit 1
fi

if [[ ! "$VERSION" ]];
then
  echo "expected version as second argument"
  exit 1
fi

TARGET_FOLDER="$BUCKET/$PLATFORM/$SCHEME/$VERSION"

echo "backing up $SCHEME version $VERSION to $TARGET_FOLDER"

aws s3 cp "$BUILD_PATH/$APP_NAME.ipa" "s3://$TARGET_FOLDER/"
aws s3 cp "$BUILD_PATH/$APP_NAME.app.dSYM.zip" "s3://$TARGET_FOLDER/"
