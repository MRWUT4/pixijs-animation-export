#!/bin/sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR
cd ..
cd ..

uglifyjs \
js/aape/movieclip.js \
js/aape/sprite.js \
js/aape/displayobjectcontainer.js \
js/aape/textfield.js \
js/aape/parse.js \
js/aape/bezier.js \
js/aape/timeline.js \
-o js/aape-1.0.0.min.js

exit 0
