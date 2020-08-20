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
sleep 60s
wget http://localhost:8080/jnlpJars/jenkins-cli.jar
jenkins_password=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)
java -jar jenkins-cli.jar -s http://localhost:8080 -auth admin:$jenkins_password install-plugin kubernetes \
                                                                                                workflow-job \
                                                                                                workflow-aggregator \
                                                                                                credentials-binding \
                                                                                                git \
                                                                                                command-launcher \
                                                                                                github-branch-source \
                                                                                                docker-workflow \
                                                                                                pipeline-utility-steps \
                                                                                                blueocean-rest \
                                                                                                blueocean-web \
                                                                                                blueocean-jwt \
                                                                                                blueocean-pipeline-scm-api \
                                                                                                blueocean-rest-impl \
                                                                                                blueocean-core-js \
                                                                                                blueocean-pipeline-api-impl \
                                                                                                blueocean-dashboard \
                                                                                                blueocean-git-pipeline \
                                                                                                blueocean-github-pipeline \
                                                                                                blueocean-display-url \
                                                                                                blueocean-config \
                                                                                                blueocean-pipeline-editor \
                                                                                                blueocean-events \
                                                                                                blueocean \
                                                                                                blueocean-executor-info \
                                                                                                blueocean-commons

# Setup k8s
sudo pip3 install awscli
sudo -iu jenkins curl -L -o /var/lib/jenkins/kubectl "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
sudo -iu jenkins chmod +x /var/lib/jenkins/kubectl
sudo -iu jenkins aws eks --region us-west-2 update-kubeconfig --name eks-cluster
