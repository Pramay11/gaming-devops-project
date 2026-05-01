pipeline {
    agent any

    environment {
        DOCKER_HUB = "your-dockerhub"
        IMAGE_NAME = "gaming-devops"
        NEXUS_URL = "http://<nexus-ip>:8081"
        SONARQUBE = "SonarQube-Server"
    }

    tools {
        jdk 'jdk17'
        nodejs 'node18'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git 'https://github.com/Pramay11/gaming-devops-project.git'
            }
        }

        // ---------------- SONARQUBE ----------------
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv("${SONARQUBE}") {
                    sh """
                    sonar-scanner \
                    -Dsonar.projectKey=gaming-devops \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=http://<sonarqube-ip>:9000 \
                    -Dsonar.login=$SONAR_AUTH_TOKEN
                    """
                }
            }
        }

        // ---------------- OWASP ----------------
        stage('OWASP Dependency Check') {
            steps {
                dependencyCheck additionalArguments: '--scan .', odcInstallation: 'OWASP-DC'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }

        // ---------------- BUILD DOCKER ----------------
        stage('Build Docker Images') {
            steps {
                sh """
                docker build -t $DOCKER_HUB/user-service ./user-service
                docker build -t $DOCKER_HUB/game-service ./game-service
                docker build -t $DOCKER_HUB/matchmaking-service ./matchmaking-service
                docker build -t $DOCKER_HUB/chat-service ./chat-service
                """
            }
        }

        // ---------------- PUSH TO DOCKER HUB ----------------
        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-creds',
                usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh """
                    echo $PASS | docker login -u $USER --password-stdin

                    docker push $DOCKER_HUB/user-service
                    docker push $DOCKER_HUB/game-service
                    docker push $DOCKER_HUB/matchmaking-service
                    docker push $DOCKER_HUB/chat-service
                    """
                }
            }
        }

        // ---------------- NEXUS UPLOAD ----------------
        stage('Upload to Nexus') {
            steps {
                sh """
                curl -v -u admin:admin123 --upload-file docker-compose.yml \
                $NEXUS_URL/repository/devops-artifacts/docker-compose.yml
                """
            }
        }

        // ---------------- K8S DEPLOY ----------------
        stage('Deploy to Kubernetes') {
            steps {
                sh """
                kubectl apply -f k8s/
                """
            }
        }
    }

    post {
        success {
            echo "Pipeline executed successfully 🚀"
        }
        failure {
            echo "Pipeline failed ❌"
        }
    }
}
