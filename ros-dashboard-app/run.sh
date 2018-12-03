#!/bin/sh
# screen -dmS docker-sesh bash -c "docker run --rm -it -v $(pwd):/data -p 8080:80 klokantech/tileserver-gl --mbtiles ./maptiles/oahu.mbtiles"
# screen -dmS node-sesh bash -c "node app.js"
node app.js
firefox https://localhost:4000
pkill node
exit