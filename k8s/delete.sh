#!/bin/bash

kubectl patch pv read-receipt-db-pv -p '{"metadata":{"finalizers": []}}' --type=merge
kubectl patch pvc read-receipt-db-pvc -p '{"metadata":{"finalizers": []}}' --type=merge
for i in *.yaml; do
    kubectl delete --force -f $i
done
