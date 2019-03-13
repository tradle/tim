#!/bin/bash

ENV_FILE="environment-cloud.json"
if [[ ! -f $ENV_FILE ]];
then
  echo "file not found: $ENV_FILE"
  exit 1
fi

TMP=$(mktemp)

aws s3 cp s3://private.tradle.io/app-secrets/env/$ENV_FILE $TMP
diff $ENV_FILE $TMP

rm $TMP