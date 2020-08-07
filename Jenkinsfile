pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                sh 'echo "Hello World"'
                sh '''
                    echo "Multiline shell steps works too"
                    cd k8s
                    ./create.sh
                '''
            }
        }
        stage('Lint HTML') {
            steps {
                sh '''
                    tidy -q -e src/view/*.pug
                '''
            }
        }
    }
}
