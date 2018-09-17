#!/bin/bash

set -euo pipefail

DIR=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
cd "$DIR/../"

if [ -f "$DIR/.env" ]
then
  source "$DIR/.env"
else
  YELLOW='\033[0;33m'
  NC='\033[0m' # No Color
  echo -e "${YELLOW}"
  echo "if you want to use a different AWS profile, create a .env file in the scripts/ dir with contents like:"
  echo "export AWS_PROFILE=yourprofilename"
  echo -e "${NC}"
fi

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
}

mk_links() {
  aws s3 cp --recursive s3://private.tradle.io/app-secrets/ secrets
  echo "placing iOS build and runtime secrets"
  cp ./secrets/ios/.env ./iOS/fastlane/
  cp ./secrets/ios/.env.staging ./iOS/fastlane/
  cp ./secrets/ios/.env.development ./iOS/fastlane/
  cp ./secrets/ios/GoogleService-Info.plist ./iOS/

  echo "placing android build and runtime secrets"
  cp ./secrets/android/fabric.properties ./android/app/
  cp ./secrets/android/google-services.json ./android/app/
  cp ./secrets/android/my-release-key.keystore ./android/app
  cp ./secrets/android/service-account-actor.json ./android/fastlane/
  cp ./secrets/android/secrets-main.xml ./android/app/src/main/res/values/secrets.xml
  cp ./secrets/android/secrets-debug.xml ./android/app/src/debug/res/values/secrets.xml

  echo "placing environment files"
  cp -r ./secrets/env/* ./
  rm -rf secrets
}

# clean
mk_links
