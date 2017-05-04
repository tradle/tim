#!/bin/bash

ROOT="$(pwd)"

clean() {
  echo "removing symlinks"
  rm -f "$ROOT/iOS/fastlane/.env"
  rm -f "$ROOT/iOS/fastlane/.env.development"
  rm -f "$ROOT/iOS/GoogleService-Info.plist"
  rm -f "$ROOT/android/app/google-services.json"
  rm -f "$ROOT/android/app/my-release-key.keystore"
  rm -f "$ROOT/android/fastlane/service-account-actor.json"
  rm -f "$ROOT/android/app/src/debug/res/values/secrets.xml"
  rm -f "$ROOT/android/app/src/main/res/values/secrets.xml"
}

mk_links() {
  echo "linking iOS build and runtime secrets"
  ln -s "$ROOT/secrets/ios/.env" "$ROOT/iOS/fastlane/"
  ln -s "$ROOT/secrets/ios/.env.development" "$ROOT/iOS/fastlane/"
  ln -s "$ROOT/secrets/ios/GoogleService-Info.plist" "$ROOT/iOS/"

  echo "linking android build and runtime secrets"
  ln -s "$ROOT/secrets/android/google-services.json" "$ROOT/android/app/"
  ln -s "$ROOT/secrets/android/my-release-key.keystore" "$ROOT/android/app"
  ln -s "$ROOT/secrets/android/service-account-actor.json" "$ROOT/android/fastlane/"
  ln -s "$ROOT/secrets/android/secrets-main.xml" "$ROOT/android/app/src/main/res/values/secrets.xml"
  ln -s "$ROOT/secrets/android/secrets-debug.xml" "$ROOT/android/app/src/debug/res/values/secrets.xml"
}

if [ "$1" == "clean" ]; then
  clean
else
  mk_links
fi
