#!/bin/bash

# set -euo pipefail

PLATFORM=${1-ios}
DEPLOYMENT=${2-Staging}

# DEPLOYMENT=${DEPLOYMENT,,} # to lowercase

if [ "$DEPLOYMENT" == "Debug" ];
then
  echo ""
else
  SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
  CODE_PUSH_JSON=$(cat "$SCRIPTS_DIR/../code-push.json")
  KEY=$(echo $CODE_PUSH_JSON | jq -r ".$PLATFORM.$DEPLOYMENT")
  # KEY=$(code-push deployment ls "tim-$PLATFORM" -k --format json | jq -r ".[] | select(.name==\"$DEPLOYMENT\").key")
  echo "$KEY"
fi
