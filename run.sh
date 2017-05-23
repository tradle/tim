#!/bin/sh
if [ -z "$DEFAULT_TRADLE_SERVER_URL" ]; then
  DEFAULT_TRADLE_SERVER_URL="http://localhost:44444"
fi

export MAIN=$(find /var/www -name "main.*.js" | head -n 1)
echo "replacing DEFAULT_TRADLE_SERVER_URL in $MAIN"

sed -i "s~DEFAULT_TRADLE_SERVER_URL~$DEFAULT_TRADLE_SERVER_URL~g" "$MAIN"

nginx
