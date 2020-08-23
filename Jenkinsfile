pipeline {
    agent any
    stages {
        stage('Login with Dockerhub Credentials') {
            steps {
                script {
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
                    sh "echo ${password} | docker login -u ${username}" --password-stdin
                }
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
