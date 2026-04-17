pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Inject Secrets & Deploy') {
            steps {
                withCredentials([file(credentialsId: 'nexus-env-file', variable: 'SECRET_ENV')]) {
                    script {
                        sh 'cp $SECRET_ENV backend/.env'

                        sh 'docker compose up -d --build'
                    }
                }
            }
        }
    }
    
    post {
        always {
            
            sh 'rm -f backend/.env'
            
            sh 'docker image prune -f'
        }
        success {
            echo 'Deployment successful! The Prompt Nexus is live.'
        }
        failure {
            echo 'Deployment failed. Check the Jenkins console output.'
        }
    }
}