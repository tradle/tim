#!/bin/bash

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the BSD-style license found in the
# LICENSE file in the root directory of this source tree. An additional grant
# of patent rights can be found in the PATENTS file in the same directory.

# Bundle React Native app's code and image assets.
# This script is supposed to be invoked as part of Xcode build process
# and relies on envoronment variables (including PWD) set by Xcode

function evil_git_dirty {
  [[ $(git diff --shortstat 2> /dev/null | tail -n1) != "" ]] && echo "*"
}

DEV=false
plistName="Info"
if [ "$PRODUCT_NAME" == "Tradle-dev" ]; then
  plistName="Dev"
fi

# Xcode project file for React Native apps is located in ios/ subfolder

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

buildPlist="Tradle/$plistName.plist"
bundleVersion=$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" $buildPlist)
gitHash=`"$SCRIPTS_DIR/get-short-commit-hash.sh"`
RELEASES_DIR="$(pwd)/../release/ios" # up from iOS
THIS_RELEASE_DIR="$RELEASES_DIR/$bundleVersion/$gitHash"

source ~/.bash_profile
source ~/.bashrc

cd ..

REACT_NATIVE_DIR="$(pwd)/node_modules/react-native"
if [ -z "$DEST" ]; then
  DEST=$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH
fi

echo "copying bundle and assets to $THIS_RELEASE_DIR"
mkdir -p "$THIS_RELEASE_DIR"
cp "$DEST/main.jsbundle" "$THIS_RELEASE_DIR/"
if [[ -f $DEST/main.jsbundle.map ]]
then
  cp "$DEST/main.jsbundle.map" "$THIS_RELEASE_DIR/"
fi
if [[ -f $DEST/main.jsbundle.meta ]]
then
  cp "$DEST/main.jsbundle.meta" "$THIS_RELEASE_DIR/"
fi

cp -r "$DEST/assets" "$THIS_RELEASE_DIR/"
rm -rf "$RELEASES_DIR/latest"
cp -r "$THIS_RELEASE_DIR" "$RELEASES_DIR/latest"
