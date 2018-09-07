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
    echo "ERROR: expected name of device as first arg. See list of known devices below:"
    echo ""
    instruments -s devices
    exit 1
  fi

  react-native run-ios --device "$DEVICE" --scheme "$SCHEME"
else
  react-native run-android
fi
