pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                sh 'echo "Deploy K8s"'
                sh '''
                    cd k8s/app
                    ./create.sh
                '''
            }
        }
    }
}
