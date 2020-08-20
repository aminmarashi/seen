#!/bin/bash

pushd ../k8s
./delete.sh
popd
aws cloudformation delete-stack --stack-name eks
