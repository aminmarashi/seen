#!/bin/bash

set -e

kubectl apply -f read-receipt-secret.yaml
kubectl apply -f read-receipt-db.yaml
kubectl apply -f read-receipt.yaml

# Install load balancers
kubectl apply -f load-balancer.yaml
echo Application Load Balancer accessible from:
kubectl get svc read-receipt-lb -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
echo
