#!/bin/bash

kubectl delete --force -f load-balancer.yaml
helm delete cde-jenkins
