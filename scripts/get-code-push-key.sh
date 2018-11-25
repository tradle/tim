#!/bin/bash

# set -euo pipefail

PLATFORM=${1-ios}
DEPLOYMENT=${2-Staging}

# DEPLOYMENT=${DEPLOYMENT,,} # to lowercase

if [ "$DEPLOYMENT" == "Debug" ];
then
  echo ""
else
  CODE_PUSH_JSON=$(cat $(dirname $0)/../code-push.json)
  KEY=$(echo $CODE_PUSH_JSON | jq -r ".$PLATFORM.$DEPLOYMENT")
  # KEY=$(code-push deployment ls "tim-$PLATFORM" -k --format json | jq -r ".[] | select(.name==\"$DEPLOYMENT\").key")
  echo "$KEY"
fi
