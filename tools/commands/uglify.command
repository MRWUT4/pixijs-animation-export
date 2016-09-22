#!/bin/sh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
cd ..
cd ..
uglifyjs \
jsfl/helper.jsfl \
jsfl/json-object.jsfl \
jsfl/json-timeline-parser.jsfl \
jsfl/atlas-exporter.jsfl \
jsfl/frame-label-exporter.jsfl \
jsfl/json-exporter.jsfl \
jsfl/pixijs-animation-export.jsfl \
-o jsfl/pixi-export.jsfl
#node ../../common/js/davidochmann/nodejs/tools/uglifyhtml.js $(pwd)
exit 0
