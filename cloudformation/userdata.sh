#!/bin/bash

set -e

# Dependencies
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common -y

# Install nodejs
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io -y

# Install pip and JRE
sudo apt-get install python3-pip -y
sudo apt-get install openjdk-8-jre -y

# Setup jenkins
sudo apt-get install jenkins -y
echo Waiting 2 minute to make sure Jenkins is running
sleep 1m
sudo chmod 777 /var/run/docker.sock
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
echo Waiting 13 minutes to make sure cluster is created, please do not stop the script
sleep 14m
sudo pip3 install awscli
sudo -iu jenkins curl -L -o /var/lib/jenkins/kubectl "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
sudo -iu jenkins chmod +x /var/lib/jenkins/kubectl
sudo -iu jenkins aws eks --region us-west-2 update-kubeconfig --name eks-cluster
