#!/bin/bash

set -e

# Dependencies
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt-get update
sudo apt-get install python3-pip -y
sudo apt-get install openjdk-8-jre -y

# Setup jenkins
sudo apt-get install jenkins -y
wget http://localhost:8080/jnlpJars/jenkins-cli.jar
jenkins_password=$(cat /var/lib/jenkins/secrets/initialAdminPassword)
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin kubernetes
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin workflow-job
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin workflow-aggregator
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin credentials-binding
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin git
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin command-launcher
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin github-branch-source
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin docker-workflow
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin pipeline-utility-steps
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-rest
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-web
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-jwt
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-pipeline-scm-api
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-rest-impl
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-core-js
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-pipeline-api-impl
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-dashboard
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-git-pipeline
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-github-pipeline
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-display-url
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-config
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-pipeline-editor
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-events
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-executor-info
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin blueocean-commons

# Setup k8s
sudo pip3 install awscli
sudo -iu jenkins curl -L -o /var/lib/jenkins/kubectl "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
sudo -iu jenkins chmod +x /var/lib/jenkins/kubectl
sudo -iu jenkins aws eks --region us-west-2 update-kubeconfig --name eks-cluster
