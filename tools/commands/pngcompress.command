#!/bin/sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
cd ..
node ../../common/js/davidochmann/nodejs/tools/pngcompress.js $(pwd)
exit 0
