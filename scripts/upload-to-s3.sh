#!/bin/bash

aws s3 sync ./web/dist/ s3://app.tradle.io/
aws cloudfront create-invalidation --distribution-id E9RQXIDLKX8ER --paths /index.html
