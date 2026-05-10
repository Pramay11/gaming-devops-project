    pipeline {
        agent any

        environment {
            DOCKER_HUB = "pramay11"
            NEXUS_URL = "http://localhost:8081"
            SONARQUBE = "SonarQube-Server"
            NVD_API_KEY = credentials('nvd-api-key')
        }

        tools {
            jdk 'jdk17'
            nodejs 'node18'
        }

        stages {

            stage('Checkout Code') {
                steps {
                    checkout scm
                }
            }

            // ---------------- SONARQUBE ----------------
            stage('SonarQube Analysis') {
    steps {
        script {
            def scannerHome = tool 'sonar-scanner'

            withCredentials([string(credentialsId: 'sonar-auth-token', variable: 'SONAR_AUTH_TOKEN')]) {

                withSonarQubeEnv("${SONARQUBE}") {

                    sh """
                    ${scannerHome}/bin/sonar-scanner \
                      -Dsonar.projectKey=gaming-devops \
                      -Dsonar.sources=. \
                      -Dsonar.login=${SONAR_AUTH_TOKEN}
                    """
                }
            }
        }
    }
}

            // ---------------- OWASP ----------------
            stage('OWASP Dependency Check') {
            steps {
                  withCredentials([string(credentialsId: 'nvd-api-key', variable: 'NVD_API_KEY')]) {
                    dependencyCheck additionalArguments: "--nvdApiKey=$NVD_API_KEY",
                                    odcInstallation: 'OWASP-DC'
             }
        }
        }


            // ---------------- BUILD DOCKER ----------------
            stage('Build Docker Images') {
                steps {
                    sh '''
                    
                    docker build -t ${DOCKER_HUB}/user-service:${TAG} ./user-service
                    docker build -t ${DOCKER_HUB}/game-service:${TAG} ./game-service
                    docker build -t ${DOCKER_HUB}/matchmaking-service:${TAG} ./matchmaking-service
                    docker build -t ${DOCKER_HUB}/chat-service:${TAG} ./chat-service
                    '''
                }
            }

            // ---------------- TRIVY IMAGE SCAN ----------------
            stage('Trivy Image Scan') {
                steps {
                    sh '''
                    
                    trivy image --format table ${DOCKER_HUB}/user-service:latest
                    trivy image --format table ${DOCKER_HUB}/game-service:latest
                    trivy image --format table ${DOCKER_HUB}/matchmaking-service:latest
                    trivy image --format table ${DOCKER_HUB}/chat-service:latest
                    '''
                }
            }

            // ---------------- SONAR QUALITY GATE ----------------
            stage('SonarQube Quality Gate') {
                steps {
                    timeout(time: 5, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }

            // ---------------- PUSH TO DOCKER HUB ----------------
           stage('Push to DockerHub') {
                steps {
                    withCredentials([usernamePassword(credentialsId: 'docker-creds', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh '''
                       

                        echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin
                        docker push ${DOCKER_HUB}/user-service:latest
                        docker push ${DOCKER_HUB}/game-service:latest
                        docker push ${DOCKER_HUB}/matchmaking-service:latest
                        docker push ${DOCKER_HUB}/chat-service:latest
                        docker logout
                        '''
                    }
                }
            }


            // ---------------- NEXUS UPLOAD ----------------
            stage('Upload to Nexus') {
    steps {

        withCredentials([
            usernamePassword(
                credentialsId: 'nexus-creds',
                usernameVariable: 'NEXUS_USER',
                passwordVariable: 'NEXUS_PASS'
            )
        ]) {

            sh '''
            curl -v -u ${NEXUS_USER}:${NEXUS_PASS} \
            --upload-file docker-compose.yml \
            ${NEXUS_URL}/repository/devops-artifacts/docker-compose.yml
            '''
        }
    }
}

            // ---------------- K8S DEPLOY ----------------
            stage('Deploy to Kubernetes') {
                steps {
                    sh 'kubectl apply -f k8s/'
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
