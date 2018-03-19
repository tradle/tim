#!/bin/bash

set -euo pipefail

npm run nodeify
npm run installhooks
npm run placesecrets
./fbdedupe.sh
./hooks/update_version.sh
npm run fixasyncstorage
npm run clean:node_modules

sed -i '' "s/EMULATOR_LOCALHOST = \"10\.0\.2\.2\";/EMULATOR_LOCALHOST = \"localhost\";/" "./node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/modules/systeminfo/AndroidInfoHelpers.java"

echo "Creating project without FaceDetector"
if [ -e node_modules/react-native-camera/ios/FaceDetector ]; then
  rm -rf node_modules/react-native-camera/ios/FaceDetector
fi
cp node_modules/react-native-camera/postinstall_project/projectWithoutFaceDetection.pbxproj node_modules/react-native-camera/ios/RNCamera.xcodeproj/project.pbxproj
