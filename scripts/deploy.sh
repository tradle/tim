#!/bin/bash

set -euo pipefail
set -x

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
source "$SCRIPTS_DIR/env.sh"

get_project_root() {
  cd "$(dirname $0)/../"
  printf $(pwd)
}

DEV_DIST_ID="E2D2Z4UNP3AOP2"
PROD_DIST_ID="E9RQXIDLKX8ER"
DEV_HOST=appdev.tradle.io
PROD_HOST=app.tradle.io
DEV_BUCKET="s3://$DEV_HOST"
PROD_BUCKET="s3://$PROD_HOST"
ORIGIN_PATH_PATH=".Origins.Items[0].OriginPath"
PROJECT_ROOT=$(get_project_root)
COMMAND="$1"

get_cloudfront_dist_conf() {
  local DIST_ID
  local CONF

  DIST_ID="$1"
  if [[ ! $DIST_ID ]]
  then
    echo "expected cloudfront distribution id as argument, got: $DIST_ID"
    exit 1
  fi

  CONF=$(aws cloudfront get-distribution-config --id "$DIST_ID" | jq .DistributionConfig)
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
  local QUESTION

  QUESTION=$1
  read -p "$QUESTION. Continue? (y/N) " -n 2 -r
  if [[ $REPLY =~ ^[\sYy\s]$ ]]
  then
    printf 'y'
  fi
}

confirm_or_abort() {
  echo ""
  RESP=$(confirm "$1")
  if [[ $RESP != "y" ]]
  then
    printf "aborting"
    exit 1
  fi
}

zip_index_html() {
  local FOLDER
  local INDEX_HTML

  FOLDER=$1
  INDEX_HTML="$FOLDER/index.html"
  echo "index html: $INDEX_HTML"
  aws s3 cp "$INDEX_HTML" - | \
  gzip -c -9 | \
  aws s3 cp \
    --content-encoding gzip \
    --cache-control max-age=0,public \
    --content-type text/html \
    --acl public-read \
    --metadata-directive REPLACE \
    - "$INDEX_HTML"
}

# gzip_to() {
#   local SOURCE
#   local DEST

#   SOURCE="$1"
#   DEST="$2"
#   # -L to de-reference symlinks
#   cp -Lr "$SOURCE/." "$DEST/"
#   # -r recursive
#   # -9 best compression
#   gzip -r -9 "$DEST"
#   while IFS= read -r file; do mv "$file" "${file%.gz}"; done < <(find "$DEST/" -type f -name "*.gz")
# }

copy_files() {
  local SOURCE
  local DEST

  SOURCE="$1"
  DEST="$2"
  aws s3 sync "$SOURCE" "$DEST"
}

short_commit_hash() {
  local HASH

  HASH=$(git rev-parse HEAD)
  printf ${HASH:0:8}
}

set_cloudfront_origin_path() {
  local DIST_ID
  local ORIGIN_PATH
  local CONF_RESP
  local ETAG
  local OLD_CONF
  local NEW_CONF
  local DIST_NAME
  local INVALIDATION_ID

  DIST_ID="$1"
  ORIGIN_PATH="$2"
  if [[ ! $DIST_ID ]] || [[ ! $ORIGIN_PATH ]]
  then
    echo "expected cloudfront distribution id and origin path, got: '$DIST_ID' and '$ORIGIN_PATH'"
    exit 1
  fi

  if [[ "${ORIGIN_PATH:0:1}" != "/" ]]
  then
    ORIGIN_PATH="/$ORIGIN_PATH"
  fi

  CONF_RESP=$(aws cloudfront get-distribution-config --id "$DIST_ID")
  ETAG=$(echo "$CONF_RESP" | jq -r .ETag)
  OLD_CONF=$(echo "$CONF_RESP" | jq .DistributionConfig)
  NEW_CONF=$(echo $OLD_CONF | jq "$ORIGIN_PATH_PATH=\"$ORIGIN_PATH\"")
  DIST_NAME=dev
  if [[ $DIST_ID == $PROD_DIST_ID ]]
  then
    DIST_NAME=prod
  fi

  confirm_or_abort "about to modify origin path on $DIST_NAME cloudfront distribution to $ORIGIN_PATH"
  aws cloudfront update-distribution --id "$DIST_ID" --distribution-config "$NEW_CONF" --if-match "$ETAG"
  clear_cache "$DIST_ID"
}

set_live_folder() {
  local DIST_ID
  local FOLDER

  DIST_ID="$1"
  FOLDER="$2"
  set_cloudfront_origin_path "$DIST_ID" "$FOLDER"
}

set_live_folder_dev() {
  set_live_folder "$DEV_DIST_ID" "$1"
}

set_live_folder_prod() {
  set_live_folder "$PROD_DIST_ID" "$1"
}

get_live_folder() {
  local DIST_ID
  local CONF
  local ORIGIN_PATH

  DIST_ID="$1"
  if [[ ! $DIST_ID ]]
  then
    echo "expected cloudfront distribution id as argument, got: $DIST_ID"
    exit 1
  fi

  CONF=$(get_cloudfront_dist_conf "$DIST_ID")
  ORIGIN_PATH=$(echo "$CONF" | jq -r "$ORIGIN_PATH_PATH")
  # cut off leading slash
  printf "${ORIGIN_PATH:1}"
}

get_prev_folder() {
  local DIST_ID
  local LIVE
  local SUFFIX
  local PREV

  DIST_ID="$1"
  if [[ ! $DIST_ID ]]
  then
    echo "expected cloudfront distribution id as argument, got: $DIST_ID"
    exit 1
  fi

  LIVE=$(get_live_folder "$DIST_ID")
  if [[ ! $LIVE =~ releases/[0-9]+$ ]]
  then
    echo "there is no previous release!"
    exit 1
  fi

  SUFFIX=${LIVE:9} # cut off releases/
  PREV="releases/$(($SUFFIX - 1))"
  printf "$PREV"
}

get_next_folder() {
  local DIST_ID
  local LIVE
  local SUFFIX
  local NEXT

  DIST_ID="$1"
  if [[ ! $DIST_ID ]]
  then
    echo "expected cloudfront distribution id as argument, got: $DIST_ID"
    exit 1
  fi

  LIVE=$(get_live_folder "$DIST_ID")
  if [[ $LIVE =~ releases/[0-9]+$ ]]
  then
    SUFFIX=${LIVE:9} # cut off releases/
    NEXT="releases/$(($SUFFIX + 1))"
  else
    NEXT="releases/1"
  fi

  printf "$NEXT"
}

get_prev_folder_dev() {
  get_prev_folder "$DEV_DIST_ID"
}

get_live_folder_dev() {
  get_live_folder "$DEV_DIST_ID"
}

get_next_folder_dev() {
  get_next_folder "$DEV_DIST_ID"
}

get_prev_folder_prod() {
  get_prev_folder "$PROD_DIST_ID"
}

get_live_folder_prod() {
  get_live_folder "$PROD_DIST_ID"
}

get_next_folder_prod() {
  get_next_folder "$PROD_DIST_ID"
}

validate_s3_path() {
  local S3_PATH

  S3_PATH="$1"
  if [[ ! $S3_PATH =~ ^s3://.*/.* ]]
  then
    echo "expected s3 folder path as argument, got: $S3_PATH"
    exit 1
  fi
}

nuke() {
  local S3_PATH

  S3_PATH=$1
  validate_s3_path "$S3_PATH"
  confirm_or_abort "about to clear the S3 path at $S3_PATH"
  aws s3 rm --recursive "$S3_PATH"
}

get_short_commit_hash() {
  local COMMIT

  COMMIT=$(git rev-parse HEAD)
  printf "${COMMIT:0:8}"
}

get_latest_web_tag() {
  local TAG

  TAG=$(git describe --abbrev=0 --tags)
  if [[ ! "$TAG" =~ -web$ ]]
  then
    echo "expected latest git tag to be x.x.x-web"
    exit 1
  fi

  printf "$TAG"
}

deploy_dev() {
  local TAG
  local BUCKET
  local FOLDER
  local BACKUP_PATH
  local DEST

  TAG=$(get_latest_web_tag)
  COMMIT=$(get_short_commit_hash)
  BUCKET="$DEV_BUCKET"
  BACKUP_PATH="$BUCKET/$TAG/$COMMIT"
  SOURCE="./web/dist"
  DEST_FOLDER=$(get_next_folder_dev)
  DEST="$BUCKET/$DEST_FOLDER"

  copy_files "$SOURCE/" "$BACKUP_PATH/"
  zip_index_html "$BACKUP_PATH"
  copy_app "$BACKUP_PATH/" "$DEST/"
  set_live_folder_dev "$DEST_FOLDER"
}

copy_with_max_age() {
  local SOURCE
  local DEST
  local MAX_AGE

  SOURCE="$1"
  DEST="$2"
  MAX_AGE="$3"

  validate_s3_path "$SOURCE"
  validate_s3_path "$DEST"

  aws s3 cp \
    --cache-control max-age=$MAX_AGE,public \
    --acl public-read \
    --metadata-directive REPLACE \
    "$SOURCE" "$DEST"
}

copy_index_html() {
  local SOURCE
  local DEST

  SOURCE="$1"
  DEST="$2"

  if [[ "$SOURCE" =~ /$ ]]
  then
    # strip slash
    SOURCE=$(echo "$SOURCE" | sed 's/\/$//')
  fi

  if [[ "$DEST" =~ /$ ]]
  then
    # strip slash
    DEST=$(echo "$DEST" | sed 's/\/$//')
  fi

  copy_with_max_age "$SOURCE/index.html" "$DEST/index.html" "0"
}

copy_app() {
  confirm_or_abort "copying from $1 to $2"
  copy_files "$1" "$2"
  # copy_index_html "$1" "$2"
}

deploy_prod() {
  local SOURCE
  local DEST_FOLDER
  local DEST

  SOURCE="$1"
  validate_s3_path "$SOURCE" || exit 1

  DEST_FOLDER=$(get_next_folder_prod)
  DEST="$PROD_BUCKET/$DEST_FOLDER/"
  # nuke $DEST
  copy_app "$SOURCE" "$DEST"
  set_live_folder_prod "$DEST_FOLDER"
}

promote_dev() {
  local LIVE_DEV

  LIVE_DEV=$(get_live_folder_dev)
  confirm_or_abort "this will copy the app version at $DEV_HOST to $PROD_HOST"
  deploy_prod "$DEV_BUCKET/$LIVE_DEV"
}

rollback_dev() {
  PREV=$(get_prev_folder_dev)
  set_live_folder_dev "$PREV"
}

rollback_prod() {
  PREV=$(get_prev_folder_prod)
  set_live_folder_prod "$PREV"
}

get_roll_fwd_folder() {
  local DIST_ID
  local HOST
  local NEXT

  DIST_ID="$1"
  HOST="$2"
  if [[ ! $DIST_ID ]] || [[ ! $HOST ]]
  then
    echo "expected cloudfront distribution id and hostname as arguments, got: $DIST_ID, $HOST"
    exit 1
  fi

  NEXT=$(get_next_folder $DIST_ID)
  HAVE=$(aws s3api head-object --bucket "$HOST" --key "$NEXT/index.html" || echo '')
  if [[ $HAVE ]]
  then
    printf "$NEXT"
  fi
}

rollfwd() {
  local DIST_ID
  local HOST
  local NEXT

  DIST_ID="$1"
  HOST="$2"
  NEXT=$(get_roll_fwd_folder $DIST_ID $HOST)
  if [[ $NEXT ]]
  then
    set_live_folder "$DIST_ID" "$NEXT"
  fi
}

rollfwd_dev() {
  rollfwd "$DEV_DIST_ID" "$DEV_BUCKET"
}

rollfwd_prod() {
  rollfwd "$PROD_DIST_ID" "$PROD_BUCKET"
}

clear_cache() {
  local DIST_ID
  local INVALIDATION_ID

  DIST_ID="$1"
  INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths /index.html | jq -r .Invalidation.Id)
  echo "waiting for invalidation to complete (5-15 minutes)"
  aws cloudfront wait invalidation-completed --distribution-id "$DIST_ID" --id "$INVALIDATION_ID"
}

clear_cache_dev() {
  clear_cache "$DEV_DIST_ID"
}

clear_cache_prod() {
  clear_cache "$PROD_DIST_ID"
}

if [[ $COMMAND != "deploy_dev" ]] && \
  [[ $COMMAND != "rollback_dev" ]] && \
  [[ $COMMAND != "rollfwd_dev" ]] && \
  [[ $COMMAND != "deploy_prod" ]] && \
  [[ $COMMAND != "promote_dev" ]] && \
  [[ $COMMAND != "rollback_prod" ]] && \
  [[ $COMMAND != "rollfwd_prod" ]]
then
  cd "$PROJECT_ROOT"
  confirm_or_abort "will eval passed in command from"
fi

eval "$@"
