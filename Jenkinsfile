pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                sh 'echo "Deploy K8s"'
                sh '''
                    export PATH="$PATH:/var/lib/jenkins/"
                    cd k8s/app
                    ./create.sh
                '''
            }
        }
    }
}
