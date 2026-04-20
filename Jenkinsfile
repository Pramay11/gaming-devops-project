pipeline {
    agent any

    stages {

        stage('Build Images') {
            steps {
                sh 'docker build -t user-service ./user-service'
                sh 'docker build -t game-service ./game-service'
            }
        }

        stage('Load Images to KIND') {
            steps {
                sh 'kind load docker-image user-service --name devops-cluster'
                sh 'kind load docker-image game-service --name devops-cluster'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/all.yaml'
            }
        }

        stage('Verify') {
            steps {
                sh 'kubectl get pods'
                sh 'kubectl get svc'
            }
        }
    }
}