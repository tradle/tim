#!/bin/bash

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd "$SCRIPTS_DIR/../"

if [ -f "$SCRIPTS_DIR/.env.sh" ]
then
  source "$SCRIPTS_DIR/.env.sh"
else
  YELLOW='\033[0;33m'
  NC='\033[0m' # No Color
  echo -e "${YELLOW}"
  echo "if you want to use a different AWS profile, create a .env.sh file in the scripts/ dir with contents like:"
  echo "export AWS_PROFILE=yourprofilename"
  echo -e "${NC}"
fi

echo "using AWS_PROFILE=${AWS_PROFILE:-default}"
