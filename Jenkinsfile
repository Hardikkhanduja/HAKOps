pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REPO = '689324611366.dkr.ecr.ap-south-1.amazonaws.com/caresetu-backend'
        IMAGE_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'caresetu-backend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      -t ${ECR_REPO}:${IMAGE_TAG} \
                      -t ${ECR_REPO}:latest \
                      ./backend
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin ${ECR_REPO}
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                sh '''
                    docker push ${ECR_REPO}:${IMAGE_TAG}
                    docker push ${ECR_REPO}:latest
                '''
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'gemini-api-key',
                        variable: 'GEMINI_API_KEY'
                    )
                ]) {
                    sh '''
                        docker pull ${ECR_REPO}:${IMAGE_TAG}

                        docker stop ${CONTAINER_NAME} || true
                        docker rm ${CONTAINER_NAME} || true

                        docker run -d \
                          --name ${CONTAINER_NAME} \
                          --restart unless-stopped \
                          -p 4000:4000 \
                          -e AWS_REGION=${AWS_REGION} \
                          -e DYNAMODB_TABLE=DischargeCarePlans \
                          -e S3_BUCKET=discharge-companion-hakops-2026 \
                          -e GEMINI_MODEL=gemini-3.5-flash-lite \
                          -e GEMINI_API_KEY="${GEMINI_API_KEY}" \
                          ${ECR_REPO}:${IMAGE_TAG}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'CareSetu backend deployed successfully!'
        }

        failure {
            echo 'CareSetu deployment failed. Check the Jenkins console log.'
        }
    }
}
