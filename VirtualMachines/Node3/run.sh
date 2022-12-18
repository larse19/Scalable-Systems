#!/bin/sh

sudo docker build -t flask .
sudo docker stop flask
sudo docker rm flask
sudo docker run -d -p 5000:5000 --name flask --network big-data-network flask