#!/usr/bin/env bash

# Get root up in here
sudo su

# Just a simple way of checking if you we need to install everything
if [ ! -d "/var/www" ]
then
    # Add mongo to apt
    apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
    echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/10gen.list

    # Update and begin installing some utility tools
    apt-get -y update
    apt-get install -y python-software-properties
    apt-get install -y vim git subversion curl
    apt-get install -y memcached build-essential
    apt-get install -y imagemagick

    # Add nodejs repo
    add-apt-repository -y ppa:chris-lea/node.js
    apt-get -y update

    # Install nodejs
    apt-get install -y nodejs

    # Install latest stable version of mongo
    apt-get install -y mongodb-10gen

    # Symlink our host www to the guest /var/www folder
    ln -s /vagrant /var/www

    # install pm2 for deployment
    npm install pm2 -g
    npm install forever -g

    # Victory!
    echo "You're all done! Setup has been completed"
fi

# get express for node
cd /var/www/
npm install --no-bin-links

echo "The IP is 10.0.33.37. Since we're binding port 80 don't forget to run node as root!"
echo "You can start node with 'node /var/www/app.js'."
