pipeline {
    agent any
    stages {
        stage('Linting JS code') {
            steps {
                sh '''
                    cd src
                    npm install
                    npm run lint
                '''
            }
        }
        stage('Login with Dockerhub Credentials') {
            steps {
                script {
                    def exists = fileExists '/var/lib/jenkins/.docker/config.json'

                    if (exists) {
                        echo 'Docker config exists skipping...'
                    } else {
                        def userInput = input(
                            id: 'userInput', message: 'Enter Dockerhub username/password',
                            parameters: [
                                string(defaultValue: '',
                                    description: 'Dockerhub username',
                                    name: 'username'),
                                string(defaultValue: '',
                                    description: 'Dockerhub password',
                                    name: 'password'),
                            ])
                        def username = userInput.username
                        def password = userInput.password
                        sh "echo ${password} | docker login -u ${username} --password-stdin"
                    }
                }
            }
        }
        stage('Build and push the image') {
            steps {
                sh '''
                    cd src
                    TAG=$GIT_COMMIT ./build.sh
                '''
            }
        }
        stage('Deploy to K8s') {
            steps {
                sh '''
                    export PATH="$PATH:/var/lib/jenkins/"
                    cd k8s
                    TAG=$GIT_COMMIT ./create.sh
                '''
            }
        }
    }
}
