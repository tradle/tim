#!/bin/bash

set -euo pipefail

source ./secrets/.env
if [ -z "$PRIVATE_BUCKET" ]; then
  echo 'expected ./secrets/.env to contain PRIVATE_BUCKET var'
  exit 1
fi

aws s3 cp ./environment-cloud.json "s3://$PRIVATE_BUCKET/fs/io.tradle.dev.tim/environment.json"
aws s3 cp ./environment-cloud.json "s3://$PRIVATE_BUCKET/fs/io.tradle.dev/environment.json"
