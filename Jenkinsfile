pipeline {
    agent any
    stages {
        stage('Get Dockerhub Credentials') {
            steps {
                script {
                    def userInput = input(
                        id: 'userInput', message: 'Enter the Dockerhub username/password',
                        parameters: [
                            string(defaultValue: 'None',
                                description: 'Dockerhub username',
                                name: 'username),
                            string(defaultValue: 'None',
                                description: 'Dockerhub password',
                                name: 'password'),
                        ])

                    username = userInput.username?:''
                    password = userInput.password?:''
                }
            }
        }
        stage('Login to Docker') {
            sh '''
                echo ${PASSWORD} | docker login -u ${USERNAME}
            '''
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
