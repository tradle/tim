#!/bin/bash

ENV_FILE="environment-cloud.json"
TMP=$(mktemp)

aws s3 cp s3://private.tradle.io/app-secrets/env/$ENV_FILE $TMP
diff $ENV_FILE $TMP

rm $TMP