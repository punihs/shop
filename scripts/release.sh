#!/usr/bin/env bash
cd ../accounts
gulp build
cd ../ops
grunt build
cd ../member
grunt build
