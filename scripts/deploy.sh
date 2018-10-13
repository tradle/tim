#!/bin/bash

set -euo pipefail
set -x

DEV_HOST=appdev.tradle.io
PROD_HOST=app.tradle.io
DEV_BUCKET="s3://$DEV_HOST"
PROD_BUCKET="s3://$PROD_HOST"
DEV_DIST_ID="E2D2Z4UNP3AOP2"
PROD_DIST_ID="E9RQXIDLKX8ER"
ORIGIN_PATH_PATH=".Origins.Items[0].OriginPath"
A="releases/a"
B="releases/b"
COMMAND="$1"

get_cloudfront_dist_conf() {
  local DIST_ID="$1"
  if [[ ! $DIST_ID ]]
  then
    printf "expected cloudfront distribution id as argument, got: $DIST_ID"
    exit 1
  fi

  local CONF=$(aws cloudfront get-distribution-config --id "$DIST_ID" | jq .DistributionConfig)
  printf "$CONF"
}

get_cloudfront_dist_conf_dev() {
  get_cloudfront_dist_conf "$DEV_DIST_ID"
}

get_cloudfront_dist_conf_prod() {
  get_cloudfront_dist_conf "$PROD_DIST_ID"
}

# https://stackoverflow.com/questions/1885525/how-do-i-prompt-a-user-for-confirmation-in-bash-script#1885670
confirm() {
  QUESTION=$1
  read -p "$QUESTION. Continue? (y/N)" -n 1 -r
  if [[ $REPLY =~ ^[Yy]$ ]]
  then
    printf 'y'
  fi
}

confirm_or_abort() {
  RESP=$(confirm "$1")
  if [[ $RESP != "y" ]]
  then
    printf "aborting"
    exit 1
  fi
}

copy() {
  local SOURCE="$1"
  local DEST="$2"
  aws s3 sync "$SOURCE" "$DEST"
}

short_commit_hash() {
  local HASH=$(git rev-parse HEAD)
  printf ${HASH:0:8}
}

set_cloudfront_origin_path() {
  local DIST_ID="$1"
  local ORIGIN_PATH="$2"
  if [[ ! $DIST_ID ]] || [[ ! $ORIGIN_PATH ]]
  then
    printf "expected cloudfront distribution id and origin path, got: '$DIST_ID' and '$ORIGIN_PATH'"
    exit 1
  fi

  if [[ "${ORIGIN_PATH:0:1}" != "/" ]]
  then
    ORIGIN_PATH="/$ORIGIN_PATH"
    # printf "expected origin path to start with a '/', got: $ORIGIN_PATH"
    # exit 1
  fi

  local CONF_RESP=$(aws cloudfront get-distribution-config --id "$DIST_ID")
  local ETAG=$(echo "$CONF_RESP" | jq -r .ETag)
  local OLD_CONF=$(echo "$CONF_RESP" | jq .DistributionConfig)
  local NEW_CONF=$(echo $OLD_CONF | jq "$ORIGIN_PATH_PATH=\"$ORIGIN_PATH\"")

  printf "$NEW_CONF"

  # aws cloudfront update-distribution --id "$DIST_ID" --distribution-config "$NEW_CONF" --if-match "$ETAG"
  # aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths /index.html
}

set_live_folder_dev() {
  set_cloudfront_origin_path "$DEV_DIST_ID" "$1"
}

set_live_folder_prod() {
  set_cloudfront_origin_path "$PROD_DIST_ID" "$1"
}

get_live_folder() {
  local DIST_ID="$1"
  if [[ ! $DIST_ID ]]
  then
    printf "expected cloudfront distribution id as argument, got: $DIST_ID"
    exit 1
  fi

  local CONF=$(get_cloudfront_dist_conf "$DIST_ID")
  local ORIGIN_PATH=$(echo "$CONF" | jq -r "$ORIGIN_PATH_PATH")
  # cut off leading slash
  printf "${ORIGIN_PATH:1}"
}

get_alt_folder() {
  local DIST_ID="$1"
  if [[ ! $DIST_ID ]]
  then
    printf "expected cloudfront distribution id as argument, got: $DIST_ID"
    exit 1
  fi

  local LIVE=$(get_live_folder "$DIST_ID")
  local ALT="$A"
  if [[ $LIVE == "$A" ]]
  then
    ALT="$B"
  fi

  printf "$ALT"
}

get_live_folder_dev() {
  get_live_folder "$DEV_DIST_ID"
}

get_alt_folder_dev() {
  get_alt_folder "$DEV_DIST_ID"
}

get_live_folder_prod() {
  get_live_folder "$PROD_DIST_ID"
}

get_alt_folder_prod() {
  get_live_folder "$PROD_DIST_ID"
}

validate_s3_path() {
  local S3_PATH="$1"
  if [[ ! $S3_PATH =~ ^s3://.*/.* ]]
  then
    printf "expected s3 folder path as argument, got: $S3_PATH"
    exit 1
  fi
}

nuke() {
  S3_PATH=$1
  validate_s3_path "$S3_PATH"
  confirm_or_abort "about to clear the S3 path at $S3_PATH"
  aws s3 rm --recursive "$S3_PATH"
}

deploy_dev() {
  local TAG=$(short_commit_hash)
  # DATE=$(date --rfc-3339=seconds)
  local BUCKET="$DEV_BUCKET"
  local BACKUP="$BUCKET/$TAG/"
  local FRESH=$(get_alt_folder_dev)

  copy ./web/dist/ "$BACKUP"
  nuke "$DEV_BUCKET/$FRESH/"
  copy "$BACKUP" "$FRESH"
  set_live_folder_dev "$FRESH"
}

deploy_prod() {
  local SOURCE="$1"
  validate_s3_path "$SOURCE"
  local FRESH=$(get_alt_folder_prod)
  nuke "$PROD_BUCKET/$FRESH/"
  copy "$SOURCE" "$FRESH"
  set_live_folder_prod "$FRESH"
}

promote_dev() {
  local LIVE_DEV=$(get_live_folder_dev)
  confirm_or_abort "this will copy the app version at $DEV_HOST to $PROD_HOST"
  deploy_prod "$DEV_BUCKET/$LIVE_DEV"
}

rollback_dev() {
  ALT=$(get_alt_folder_dev)
  set_live_folder_dev "$ALT"
}

rollback_prod() {
  ALT=$(get_alt_folder_prod)
  set_live_folder_prod "$ALT"
}

if [[ $COMMAND == "deploy-dev" ]]
then
  deploy-dev
elif [[ $COMMAND == "rollback-dev" ]]
then
  rollback_dev
elif [[ $COMMAND == "promote-dev" ]]
then
  promote_dev
elif [[ $COMMAND == "rollback-prod" ]]
then
  rollback_prod
elif [[ $COMMAND ]]
then
  confirm_or_abort "will eval passed in command"
  eval "$@"
else
  printf "unknown command"
  exit 1
fi
