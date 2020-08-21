pipeline {
    agent any
    stages {
        stage('Get Dockerhub Credentials') {
            steps {
                script {
                    def username = input(
                        id: 'username', message: 'Enter Dockerhub username',
                        parameters: [
                            string(defaultValue: '',
                                description: 'Dockerhub username',
                                name: 'username'),
                        ])
                    def password = input(
                        id: 'password', message: 'Enter Dockerhub password',
                        parameters: [
                            string(defaultValue: '',
                                description: 'Dockerhub password',
                                name: 'password'),
                        ])
                }
            }
        }
        stage('Login to Docker') {
            steps {
                sh '''
                    env
                    echo ${password} | docker login -u ${username}
                '''
            }
        }
        stage('Build and push the image') {
            steps {
                sh '''
                    cd src
                    ./build.sh
                '''
            }
        }
        stage('Deploy to K8s') {
            steps {
                sh '''
                    export PATH="$PATH:/var/lib/jenkins/"
                    cd k8s
                    ./create.sh
                '''
            }
        }
    }
}
