#!/bin/bash

if [ -n "$TIME_DELAY" ]; then
    sleep $TIME_DELAY
fi

if [ "$FAILING_JOB" = "true" ]; then
    exit 1;
fi

if [ "$TEST_JOB" = "true" ]; then
    mocha --compilers js:babel/register \
          --reporter spec \
          --timeout 5m \
          test/test.js
fi
