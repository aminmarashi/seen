#!/bin/bash

CONFIG_LOC=/tmp/kubeconfig
for i in *.yaml; do
    kubectl --kubeconfig $CONFIG_LOC delete --force -f $i
done
