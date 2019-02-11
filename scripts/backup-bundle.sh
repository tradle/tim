#!/bin/bash

set -x
set -euo pipefail

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
source "$SCRIPTS_DIR/env.sh"

cd "$SCRIPTS_DIR/../"

BUCKET="tradle-app-releases"
APP_NAME="Tradle"
PLATFORM="$1"
BUNDLE_DIR="$2" # from project root

if [[ "$PLATFORM" != "ios" ]] && [[ "$PLATFORM" != "android" ]];
then
  echo "expected 1st argument to be 'ios' or 'android'"
  exit 1
fi

if [[ ! -d "$BUNDLE_DIR" ]];
then
  echo "bundle dir $BUNDLE_DIR does not exist"
  exit 1
fi

TARGET_FOLDER="$BUCKET/$BUNDLE_DIR"

echo "backing up code-push bundle to $TARGET_FOLDER"
aws s3 cp "$BUNDLE_DIR" "s3://$TARGET_FOLDER/" --recursive
