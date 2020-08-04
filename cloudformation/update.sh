#!/bin/bash

aws cloudformation update-stack --stack-name eks --template-body file://eks.yaml --parameters file://parameters.json --capabilities CAPABILITY_IAM
