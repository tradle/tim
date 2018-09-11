#!/bin/sh

PLATFORM=${1-ios}
# to lowercase
PLATFORM=$(echo "$PLATFORM" | tr '[:upper:]' '[:lower:]')
DEVICE="$2"

if [ "$PLATFORM" == "ios" ]
then
  SCHEME=${3-Debug}

  if [ -z "$DEVICE" ]
  then
    react-native run-ios --device --scheme "$SCHEME"
  else
    react-native run-ios --device "$DEVICE" --scheme "$SCHEME"
  fi
else
  react-native run-android
fi
