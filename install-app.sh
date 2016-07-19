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

buildPlist="Tradle/$plistName.plist"
bundleVersion=$(/usr/libexec/PlistBuddy -c "Print CFBundleVersion" $buildPlist)
gitHash=$(git rev-parse HEAD)
RELEASES_DIR="$(pwd)/../release" # up from iOS
THIS_RELEASE_DIR="$RELEASES_DIR/$bundleVersion/${gitHash:0:10}"

case "$CONFIGURATION" in
  Debug)
  exit 0 # avoid building bundle in Debug mode
    # DEV=true
    ;;
  Release)
    # if [ "$(evil_git_dirty)" == "*" ]; then
    #   echo "TRADLE DEVELOPER, YOU HAVE UNSTAGED CHANGES, PLEASE COMMIT BEFORE BUILDING A RELEASE"
    #   exit 1
    # fi
    ;;
  "")
    DEST=$THIS_RELEASE_DIR # build bundle to local dir
    ;;
  *)
    echo "Unsupported value of \$CONFIGURATION=$CONFIGURATION"
    exit 1
    ;;
esac

source ~/.bash_profile
source ~/.bashrc

cd ..

REACT_NATIVE_DIR="$(pwd)/node_modules/react-native"
if [ -z "$DEST" ]; then
  DEST=$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH
fi

# Define NVM_DIR and source the nvm.sh setup script
[ -z "$NVM_DIR" ] && export NVM_DIR="$HOME/.nvm"

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  . "$HOME/.nvm/nvm.sh"
elif [[ -x "$(command -v brew)" && -s "$(brew --prefix nvm)/nvm.sh" ]]; then
  . "$(brew --prefix nvm)/nvm.sh"
fi

copy_bundle() {
  if [ "$DEV" == false ]; then
    echo "copying bundle and assets to $THIS_RELEASE_DIR"
    mkdir -p "$THIS_RELEASE_DIR"
    cp "$DEST/main.jsbundle" "$THIS_RELEASE_DIR/"
    cp "$DEST/main.jsbundle.map" "$THIS_RELEASE_DIR/"
    cp -r "$DEST/assets" "$THIS_RELEASE_DIR/"
    rm -rf "$RELEASES_DIR/latest"
    cp -r "$THIS_RELEASE_DIR" "$RELEASES_DIR/latest"
  fi
}

# if [ -f "$THIS_RELEASE_DIR/main.jsbundle" ]; then
#   echo "build exists in $THIS_RELEASE_DIR, copying"
#   mkdir -p "$DEST"
#   cp "$THIS_RELEASE_DIR/main.jsbundle" "$DEST/"
#   cp -r "$THIS_RELEASE_DIR/assets" "$DEST/"
# else
  echo "writing bundle and assets to $DEST"
  # rm -rf $TMPDIR/react-*
  set -x
  node "$REACT_NATIVE_DIR/local-cli/cli.js" bundle \
    --entry-file index.ios.js \
    --platform ios \
    --dev $DEV \
    --reset-cache true \
    --sourcemap-output "$DEST/main.jsbundle.map" \
    --bundle-output "$DEST/main.jsbundle" \
    --assets-dest "$DEST" && copy_bundle
# fi
