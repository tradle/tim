#!/bin/bash

aws s3 sync ./web/dist/ s3://app.tradle.io/
