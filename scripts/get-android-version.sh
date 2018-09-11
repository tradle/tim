#!/bin/bash
TYPE=${1-semver}

export $(cat $(dirname "$0")/../android/gradle.properties | grep -v "^#" | grep "^VERSION_" | xargs)
SHORT="$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH"
if [ "$TYPE" == "semver" ];
then
  echo $SHORT
elif [ "$TYPE" == "full" ]
then
  echo "$SHORT.$VERSION_BUILD"
elif [ "$TYPE" == "build" ];
then
  echo "$VERSION_BUILD"
else
  echo "expected version type as first arg, one of: semver, full, build"
  exit 1
fi
