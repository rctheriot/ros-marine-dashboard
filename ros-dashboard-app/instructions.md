# ROS Dashboard

## Maps
### Install Docker

    `$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -`
    `$ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs)` stable"
    `$ sudo apt-get update`
    `$ sudo apt-get install -y docker-ce`
    
### Starting MapTile Server

    `$ sudo service docker start`

This command will start the maptile server. It will also install the application if you haven't already done so (requires internet connection the first time to install application)
 
    `$ docker  run  --rm  -it  -v  $(pwd):/data  -p  8080:80  klokantech/tileserver-gl ./maptiles/oahu.mbtiles`