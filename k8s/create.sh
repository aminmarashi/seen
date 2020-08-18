#!/bin/bash

# Install jenkins
helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm install cde-jenkins --values jenkins.yaml stable/jenkins
JENKINS_POD=$(kubectl get pods --selector app.kubernetes.io/instance=cde-jenkins -o name | awk -F/ '{print $2}')
kubectl wait --for=condition=ready pod $JENKINS_POD

# Install kubectl on Jenkins
curl -Lo /tmp/kubectl https://storage.googleapis.com/kubernetes-release/release/v1.18.8/bin/linux/amd64/kubectl
kubectl cp /tmp/kubectl $JENKINS_POD:/opt/kubectl

# Install load balancers
kubectl apply -f load-balancer.yaml
echo Jenkins Load Balancer accessible from:
kubectl get svc cde-jenkins-lb -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
