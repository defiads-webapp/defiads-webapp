#!/bin/sh
yarn browserify dist/app.js -o target.js
echo "<!-- Defiads Webapp build. Feel free to modify config at line 7 -->" > target.html
echo "<script>" >> target.html
cat target.js >> target.html
echo "</script>" >> target.html
echo "<style>" >> target.html
cat css/*.css >> target.html
echo "</style>" >> target.html
cat index.html | grep -v "</script>" | grep -v '<link rel="stylesheet" href="css/bootstrap-grid.min.css">' >> target.html
