SET current=%~dp0
SET parent=%current:~0,-6%

node ../../../common/js/davidochmann/nodejs/tools/uglifyhtml.js %parent%