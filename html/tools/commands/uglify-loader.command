#!/bin/sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR
cd ..
cd ..

uglifyjs \
js/aape/eventdispatcher.js \
js/aape/loader.js \
js/aape/urlrequest.js \
js/aape/loaditem.js \
-o js/loader-1.0.0.min.js

exit 0
