#!/bin/bash

DATE=$(date --rfc-3339=seconds)
RELEASE_FOLDER="s3://app.tradle.io/releases/$DATE/"
# upload to folder for current date
aws s3 sync ./web/dist/ "$RELEASE_FOLDER"
# clean /releases/latest
aws s3 rm --recursive s3://app.tradle.io/releases/latest/
# copy new release to /releases/latest
aws s3 sync "$RELEASE_FOLDER" s3://app.tradle.io/releases/latest/
# invalidate cache
aws cloudfront create-invalidation --distribution-id E9RQXIDLKX8ER --paths /index.html
