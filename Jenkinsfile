pipeline{
    agent any

     environment {
         SONAR_PROJECT_KEY = 'MULTIAIAGENT'
	 	 SONAR_SCANNER_HOME = tool 'Sonarqube'
         AWS_REGION = 'us-east-1'
         ECR_REPO = 'multi-ai-agent'
         IMAGE_TAG = 'latest'
         ECS_CLUSTER_NAME = "${env.ECS_CLUSTER_NAME ?: 'multi-ai-agent'}"
         ECS_SERVICE_NAME = "${env.ECS_SERVICE_NAME ?: 'multi-ai-agent-def-service-90a78822'}"
	 }

    stages{
        stage('Cloning Github repo to Jenkins'){
            steps{
                script{
                    echo 'Cloning Github repo to Jenkins............'
                    checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/P-SAIKISHAN/Multi-AI-Agent-.git']])
                }
            }
        }

     stage('SonarQube Analysis'){
	 		steps {
	 			withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
    					
	 				withSonarQubeEnv('sonarqube') {
     						sh """
	 					${SONAR_SCANNER_HOME}/bin/sonar-scanner \
	 					-Dsonar.projectKey=${SONAR_PROJECT_KEY} \
	 					-Dsonar.sources=. \
	 					-Dsonar.host.url=http://sonarqube-dind:9000 \
	 					-Dsonar.login=${SONAR_TOKEN}
	 					"""
	 				}
	 			}
	 		}
		}

    stage('Build and Push Docker Image to ECR') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-token']]) {
                    script {
                        def accountId = sh(script: "aws sts get-caller-identity --query Account --output text", returnStdout: true).trim()
                        def ecrUrl = "${accountId}.dkr.ecr.${env.AWS_REGION}.amazonaws.com/${env.ECR_REPO}"

                        sh """
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ecrUrl}
                        docker build -t ${env.ECR_REPO}:${IMAGE_TAG} -f app/Dockerfile .
                        docker tag ${env.ECR_REPO}:${IMAGE_TAG} ${ecrUrl}:${IMAGE_TAG}
                        docker push ${ecrUrl}:${IMAGE_TAG}
                        """
                    }
                }
            }
        }

        stage('Deploy to ECS Fargate') {
    steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-token']]) {
            script {
                sh """
                # Validate cluster exists before deployment
                echo "Validating ECS cluster 'multi-ai-agent' in region '${AWS_REGION}'"
                aws ecs describe-clusters \
                  --clusters multi-ai-agent \
                  --region ${AWS_REGION} \
                  --query 'clusters[0].clusterStatus' \
                  --output text || {
                    echo "ERROR: ECS cluster 'multi-ai-agent' not found in region '${AWS_REGION}'. Check AWS_REGION environment variable."
                    exit 1
                  }

                echo "Updating ECS service..."
                aws ecs update-service \
                  --cluster multi-ai-agent \
                  --service multi-ai-agent-def-service-90a78822  \
                  --force-new-deployment \
                  --region ${AWS_REGION}
                """
                }
            }
        }
     }
        
    }
}
