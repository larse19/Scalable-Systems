#!/bin/sh

sudo docker build -t spark .
sudo docker run --rm -d --network big-data-network spark