#!/bin/sh

sudo docker build -t sparkcassandra .
sudo docker run --rm -d -it --network big-data-network sparkcassandra