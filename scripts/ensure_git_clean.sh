#!/bin/bash

red() {
  echo -e "\033[1;31m WARNING \033[0m"
  echo "$@"
}

if [[ $(git diff --shortstat 2> /dev/null | tail -n1) != "" ]]; then
  red "git status must be clean before building a Release"
  exit 1
fi
