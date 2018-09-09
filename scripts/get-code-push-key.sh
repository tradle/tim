#!/bin/bash

set -euo pipefail

PLATFORM=${1-ios}
DEPLOYMENT=${2-Staging}
KEY=$(code-push deployment ls "tim-$PLATFORM" -k --format json | jq -r ".[] | select(.name==\"$DEPLOYMENT\").key")
echo "$KEY"
