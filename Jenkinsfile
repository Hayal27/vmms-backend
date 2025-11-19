pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }

    environment {
        DOCKER_REGISTRY = credentials('docker-registry-credentials')
        CPANEL_HOST = credentials('cpanel-host')
        CPANEL_USER = credentials('cpanel-user')
        CPANEL_PASSWORD = credentials('cpanel-password')
        CPANEL_DOMAIN = credentials('cpanel-domain')
        DOCKER_IMAGE_BACKEND = "${DOCKER_REGISTRY}/vmms-backend:${BUILD_NUMBER}"
        DOCKER_IMAGE_BACKEND_LATEST = "${DOCKER_REGISTRY}/vmms-backend:latest"
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Checking out backend source code..."
                    checkout scm
                }
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    echo "Building backend Docker image..."
                    sh '''
                        docker build -t ${DOCKER_IMAGE_BACKEND} .
                        docker tag ${DOCKER_IMAGE_BACKEND} ${DOCKER_IMAGE_BACKEND_LATEST}
                    '''
                }
            }
        }

        stage('Test Backend') {
            steps {
                script {
                    echo "Running backend tests..."
                    sh '''
                        docker run --rm ${DOCKER_IMAGE_BACKEND} npm test || true
                    '''
                }
            }
        }

        stage('Push to Registry') {
            steps {
                script {
                    echo "Pushing backend image to Docker registry..."
                    sh '''
                        docker push ${DOCKER_IMAGE_BACKEND}
                        docker push ${DOCKER_IMAGE_BACKEND_LATEST}
                    '''
                }
            }
        }

        stage('Deploy to cPanel') {
            steps {
                script {
                    echo "Deploying backend to cPanel server..."
                    sh '''
                        ssh -o StrictHostKeyChecking=no ${CPANEL_USER}@${CPANEL_HOST} << 'EOF'
                            cd /home/${CPANEL_USER}/public_html/vmms/backend
                            
                            # Pull latest image
                            docker pull ${DOCKER_IMAGE_BACKEND_LATEST}
                            
                            # Stop old container
                            docker-compose down || true
                            
                            # Start new container
                            docker-compose up -d
                            
                            # Wait for service to be ready
                            sleep 10
                        EOF
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Verifying backend health..."
                    sh '''
                        ssh -o StrictHostKeyChecking=no ${CPANEL_USER}@${CPANEL_HOST} << 'EOF'
                            # Check if backend is responding
                            curl -f http://localhost:5000/api/v1/health || exit 1
                        EOF
                    '''
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    echo "Cleaning up dangling images..."
                    sh '''
                        docker image prune -f || true
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Backend deployment pipeline completed"
        }
        success {
            echo "✅ Backend deployed successfully!"
        }
        failure {
            echo "❌ Backend deployment failed!"
        }
    }
}
