#!/bin/sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR
cd ..
cd ..

uglifyjs --keep-fnames \
html/js/aape/eventdispatcher.js \
html/js/aape/loader.js \
html/js/aape/urlrequest.js \
html/js/aape/loaditem.js \
-o html/js/loader-1.0.0.min.js

exit 0
