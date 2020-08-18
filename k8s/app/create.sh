#!/bin/bash


kubectl apply -f eks-nvme-ssd-provisioner.yaml
kubectl apply -f storage-local-static-provisioner.yaml
kubectl apply -f read-receipt-local-storage.yaml
kubectl apply -f local-storage.yaml
kubectl apply -f read-receipt-secret.yaml
kubectl apply -f read-receipt-db.yaml
kubectl apply -f read-receipt.yaml

# Install load balancers
kubectl apply -f load-balancer.yaml
echo Application Load Balancer accessible from:
kubectl get svc read-receipt-lb -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
echo
