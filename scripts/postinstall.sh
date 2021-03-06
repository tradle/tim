#!/bin/bash

set -euo pipefail

echo "removing react-native peer deps that prevent shrinkwrap from being written"
./scripts/rm-rn-peerdeps.js

npm run nodeify
npm run installhooks
npm run loadsecrets
./fbdedupe.sh
./hooks/update_version.sh

# https://github.com/facebook/react-native/issues/16106#issuecomment-437573973
cd node_modules/react-native ; ./scripts/ios-install-third-party.sh ; cd ../../
cd node_modules/react-native/third-party/glog-0.3.5/ ; sh ../../scripts/ios-configure-glog.sh ; cd ../../../../

node ./scripts/rm-unused-components.js
node ./scripts/fix-node_modules.js
# npm run dedupe-deps
# node ./scripts/dedupe-deps.js
npm run clean:node_modules

patch-package

sed -i '' "s/EMULATOR_LOCALHOST = \"10\.0\.2\.2\";/EMULATOR_LOCALHOST = \"localhost\";/" "./node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/modules/systeminfo/AndroidInfoHelpers.java"
./scripts/fix-bluebird.sh

echo "Creating project without FaceDetector"
if [ -e node_modules/react-native-camera/ios/FaceDetector ]; then
  rm -rf node_modules/react-native-camera/ios/FaceDetector
fi
cp node_modules/react-native-camera/postinstall_project/projectWithoutFaceDetection.pbxproj node_modules/react-native-camera/ios/RNCamera.xcodeproj/project.pbxproj

npm run fix:staging

jetify

