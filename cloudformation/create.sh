#!/bin/bash

aws cloudformation create-stack --stack-name eks --template-body file://eks.yaml --parameters file://parameters.json --capabilities CAPABILITY_IAM
echo Waiting 15 minutes to make sure cluster creation is completed, please do not stop the script
sleep 15m
./kubeconfig.sh
