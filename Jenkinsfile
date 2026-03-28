pipeline {

    agent any

    environment {
        IMAGE_NAME         = 'dit-bibliotheque-frontend'
        IMAGE_TAG          = "${BUILD_NUMBER}"
        CONTAINER_FRONTEND = 'projet_devops_frontend'
    }

    triggers {
        // Nous vérifions le repo toutes les 5 minutes pour détecter les nouveaux commits
        pollSCM('H/5 * * * *')
    }

    stages {

        // Étape 1 — Récupération du code depuis GitHub sur la branche de travail
        stage('Récupération du code') {
            steps {
                echo 'Récupération du code source depuis GitHub...'
                git branch: 'feature/samuel-frontend',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/spirittechrevolution/devops-project-frontend.git'
            }
        }

        // Étape 2 — Installation des dépendances
        stage('Installation des dépendances') {
            steps {
                echo 'Installation des dépendances Node.js...'
                sh 'npm ci'
            }
        }

        // Étape 3 — Vérification que le build React compile sans erreur
        stage('Build de vérification') {
            steps {
                echo 'Compilation du build React...'
                sh 'npm run build'
            }
        }

        // Étape 4 — Construction de l'image Docker en local
        // Nous ne publions pas sur Docker Hub, l'image reste dans le cache Docker local
        stage('Construction de l\'image Docker') {
            steps {
                echo "Construction de l'image ${IMAGE_NAME}:${IMAGE_TAG}..."
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
                echo "Image disponible localement : ${IMAGE_NAME}:latest"
            }
        }

        // Étape 5 — Déploiement du frontend
        stage('Déploiement') {
            steps {
                echo 'Déploiement du frontend...'

                // Nous arrêtons et supprimons le container existant avant de redéployer
                sh "docker stop ${CONTAINER_FRONTEND} || true"
                sh "docker rm ${CONTAINER_FRONTEND} || true"

                sh """
                    docker run -d \
                        --name ${CONTAINER_FRONTEND} \
                        --network projet_devops_network \
                        -p 5173:80 \
                        --restart unless-stopped \
                        ${IMAGE_NAME}:latest
                """
            }
        }

        // Étape 6 — Vérification que le frontend répond bien
        stage('Vérification du déploiement') {
            steps {
                echo 'Vérification de la santé du frontend...'
                sh '''
                    timeout=30
                    while ! curl -sf http://localhost:5173/health > /dev/null 2>&1; do
                        timeout=$((timeout - 2))
                        if [ $timeout -le 0 ]; then
                            echo "Le frontend n'a pas répondu dans les temps"
                            docker logs ${CONTAINER_FRONTEND} --tail=30
                            exit 1
                        fi
                        sleep 2
                    done
                    echo "Frontend opérationnel sur http://localhost:5173"
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline frontend réussi — build ${BUILD_NUMBER}."
            echo "Image disponible localement : ${IMAGE_NAME}:latest"
            echo "Frontend accessible sur http://localhost:5173"
        }
        failure {
            echo "Pipeline frontend échoué — build ${BUILD_NUMBER}."
            sh "docker logs ${CONTAINER_FRONTEND} --tail=50 || true"
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
