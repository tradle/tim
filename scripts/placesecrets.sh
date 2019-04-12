#!/bin/bash

set -euo pipefail

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
source "$SCRIPTS_DIR/env.sh"

clean() {
  echo "removing placed secrets"
  rm -f ./iOS/fastlane/.env
  rm -f ./iOS/fastlane/.env.staging
  rm -f ./iOS/fastlane/.env.development
  rm -f ./iOS/GoogleService-Info.plist
  rm -f ./android/app/google-services.json
  rm -f ./android/app/my-release-key.keystore
  rm -f ./android/fastlane/service-account-actor.json
  rm -f ./android/app/src/debug/res/values/secrets.xml
  rm -f ./android/app/src/main/res/values/secrets.xml
  rm -f ./environment*.json
  rm -f ./code-push.json
}

mk_links() {
  aws s3 cp --recursive s3://private.tradle.io/app-secrets/ secrets
  echo "placing iOS build and runtime secrets"
  cp ./secrets/ios/.env ./iOS/fastlane/
  cp ./secrets/ios/.env.staging ./iOS/fastlane/
  cp ./secrets/ios/.env.development ./iOS/fastlane/
  cp ./secrets/ios/GoogleService-Info.plist ./iOS/
  # for Regula
  cp ./secrets/ios/regula.license iOS/
  # cp ./secrets/regula-db.dat ./iOS/db.dat

  echo "placing android build and runtime secrets"
  cp ./secrets/android/fabric.properties ./android/app/
  cp ./secrets/android/google-services.json ./android/app/
  cp ./secrets/android/my-release-key.keystore ./android/app
  cp ./secrets/android/service-account-actor.json ./android/fastlane/
  cp ./secrets/android/secrets-main.xml ./android/app/src/main/res/values/secrets.xml
  for dir in `find ./android/app/src/main/res -maxdepth 1 -name "values-*"`;
  do
    cp ./android/app/src/main/res/values/secrets.xml $dir/
  done

  cp ./secrets/android/secrets-debug.xml ./android/app/src/debug/res/values/secrets.xml
  # for Regula
  mkdir -p ./android/app/src/main/res/raw/
  mkdir -p ./android/src/main/assets/Regula/
  # cp ./secrets/regula-db.dat ./android/src/main/assets/Regula/db.dat
  cp ./secrets/android/regula.license ./android/app/src/main/res/raw/

  cp ./secrets/zoom/ZoomHybrid-enc-key-pub.pem iOS/ZoomHybrid.pub

  echo "placing environment files"
  cp -r ./secrets/env/* ./

  echo "placing code-push file"
  cp ./secrets/code-push.json .

  rm -rf secrets
}

# clean
mk_links
