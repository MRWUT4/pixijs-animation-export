#!/bin/sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
cd ..
cd ..
node ../../common/js/davidochmann/nodejs/tools/uglifyhtml.js $(pwd)
exit 0
