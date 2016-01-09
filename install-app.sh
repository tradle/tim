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

DEV=false
case "$CONFIGURATION" in
  Debug)
    DEV=true
    ;;
  Release)
    ;;
  RABOBANK)
    ;;
  LLOYDS)
    ;;
  TRADLE)
    ;;
  "")
    DEST="release" # build bundle to local dir
    ;;
  *)
    echo "Unsupported value of \$CONFIGURATION=$CONFIGURATION"
    exit 1
    ;;
esac

# Xcode project file for React Native apps is located in ios/ subfolder
cd ..

set -x
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

# if [ -f ios/main.jsbundle ]; then
#   cp ios/main.jsbundle $DEST/main.jsbundle
#   cp -r ios/assets $DEST/
# else
  react-native bundle \
    --entry-file index.ios.js \
    --platform ios \
    --dev $DEV \
    --bundle-output "$DEST/main.jsbundle" \
    --assets-dest "$DEST" \
    --verbose
# fi
