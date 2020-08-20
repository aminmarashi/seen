#!/bin/bash

for i in *.yaml; do
    kubectl delete --force -f $i
done
