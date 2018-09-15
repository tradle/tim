#!/bin/bash

set -euo pipefail

PLATFORM=${1-ios}
DEPLOYMENT=${2-Staging}

# DEPLOYMENT=${DEPLOYMENT,,} # to lowercase

if [ "$DEPLOYMENT" == "Debug" ];
then
  echo ""
else
  KEY=$(code-push deployment ls "tim-$PLATFORM" -k --format json | jq -r ".[] | select(.name==\"$DEPLOYMENT\").key")
  echo "$KEY"
fi
