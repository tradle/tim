#!/bin/bash

set -euo pipefail

fetch_zoom() {
  if [ -d "node_modules/react-native-facetec-zoom" ] && [ ! -d "node_modules/react-native-facetec-zoom/ios/ZoomAuthenticationHybrid.framework" ]
  then
    if [ -f "./scripts/.env" ]
    then
      source ./scripts/.env
    fi

    ZIP_NAME="ZoomAuthenticationHybrid.framework-6.8.0.zip"
    # TARGET_DIR="node_modules/react-native-facetec-zoom/ios"
    TARGET_DIR="ios"
    set -x
    if [ ! -f "$TARGET_DIR/$ZIP_NAME" ]
    then
      aws s3 cp "s3://app.tradle.io/sdk/$ZIP_NAME" "$TARGET_DIR/"
    fi

    unzip "$TARGET_DIR/$ZIP_NAME" -d "$TARGET_DIR/"
    rm "$TARGET_DIR/$ZIP_NAME"
    set +x
    unzip
  fi
}

fetch_zoom &

echo "removing react-native peer deps that prevent shrinkwrap from being written"
./scripts/rm-rn-peerdeps.js

npm run nodeify
npm run installhooks
npm run loadsecrets
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

npm run fix:staging

wait
