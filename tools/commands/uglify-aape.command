#!/bin/sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR
cd ..
cd ..

uglifyjs --keep-fnames \
html/js/aape/movieclip.js \
html/js/aape/displayobjectcontainer.js \
html/js/aape/textfield.js \
html/js/aape/parse.js \
html/js/aape/bezier.js \
html/js/aape/cache.js \
html/js/aape/timeline.js \
-o html/js/aape-1.0.1.min.js

# exit 0
