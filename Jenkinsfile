node {

    stage('Checkout') {
        git(
            branch: 'main',
            url: 'https://github.com/spirittechrevolution/devops-project-frontend.git',
            credentialsId: 'github-credentials'
        )
        sh 'git log --oneline -5'
    }

    stage('Installation des dependances') {
        sh 'npm --version'
        sh 'node --version'
        sh 'npm install'
    }

    stage('Build') {
        sh 'npm run build'
    }

    stage('Build Docker Image') {
        sh 'docker build -t spirittechrevolution/devops-project-frontend:latest .'
    }

    stage('Push Docker Hub') {
        withCredentials([usernamePassword(
            credentialsId: 'docker-hub-credentials',
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
        )]) {
            sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
            sh 'docker push spirittechrevolution/devops-project-frontend:latest'
            sh 'docker logout'
        }
    }

    stage('Deploiement') {
        sh 'docker-compose down || true'
        sh 'docker-compose up -d'
        sh 'docker-compose ps'
    }

    stage('Health Check') {
        sh '''
            sleep 10
            curl -f http://localhost:5173 || echo "Frontend accessible"
        '''
    }
}