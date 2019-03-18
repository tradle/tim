#!/bin/bash

ENV_FILE="environment-cloud.json"
if [[ ! -f $ENV_FILE ]];
then
  echo "file not found: $ENV_FILE"
  exit 1
fi

aws s3 cp $ENV_FILE "s3://private.tradle.io/app-secrets/env/$ENV_FILE"
aws s3 cp $ENV_FILE s3://private-fs-dev-fs-18eru6dvf3p8h/fs/io.tradle.dev.tim/environment.json
aws s3 cp $ENV_FILE s3://private-fs-dev-fs-18eru6dvf3p8h/fs/io.tradle.dev/environment.json
