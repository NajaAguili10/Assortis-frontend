pipeline {
    agent any

    // ── Configurable parameters ───────────────────────────────────────────────
    parameters {

        string(
            name: 'IMAGE_NAME',
            defaultValue: 'assortis-frontend',
            description: 'Docker image name'
        )
        string(
            name: 'HOST_PORT',
            defaultValue: '9989',
            description: 'Host port to expose the container on'
        )
        string(
            name: 'CONTAINER_NAME',
            defaultValue: 'assortis-frontend',
            description: 'Running container name'
        )
        string(
            name: 'BRANCH',
            defaultValue: 'Dev',
            description: 'Git branch to build'
        )
    }

    environment {
        IMAGE_TAG    = "${params.REGISTRY}/${params.IMAGE_NAME}:${BUILD_NUMBER}"
        IMAGE_LATEST = "${params.REGISTRY}/${params.IMAGE_NAME}:latest"
    }

    stages {

        // ── 1. Checkout ──────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${params.BRANCH}"]],
                    userRemoteConfigs: scm.userRemoteConfigs,
                    extensions: [[$class: 'CleanBeforeCheckout']]
                ])
            }
        }

        // ── 2. Install & Build (artifact smoke-test) ─────────────────────────
        stage('Install & Build') {
            steps {
                sh '''
                docker run --rm \
                -v $PWD:/app \
                -w /app \
                node:20-alpine \
                sh -c "node --version && npm install && npm run build"
                '''
            }
        }

        // ── 3. Docker – Build image ──────────────────────────────────────────
        stage('Docker Build') {
            steps {
                sh "docker build --tag ${IMAGE_TAG} --tag ${IMAGE_LATEST} ."
            }
        }

        // ── 4. Deploy – stop old, run new container ───────────────────────────
        stage('Deploy') {
            steps {
                sh """
                    # Stop and remove existing container (ignore errors if not running)
                    docker stop ${params.CONTAINER_NAME} 2>/dev/null || true
                    docker rm   ${params.CONTAINER_NAME} 2>/dev/null || true

                    # Run new container on the configured host port
                    docker run -d \\
                        --name ${params.CONTAINER_NAME} \\
                        --restart unless-stopped \\
                        -p ${params.HOST_PORT}:80 \\
                        ${IMAGE_TAG}

                    echo "✅ Deployed on http://\$(hostname -I | awk '{print \$1}'):${params.HOST_PORT}"
                """
            }
        }

        // ── 5. Smoke test ─────────────────────────────────────────────────────
        stage('Smoke Test') {
            steps {
                sh """
                    # Wait for nginx to start
                    sleep 5
                    STATUS=\$(curl -s -o /dev/null -w '%{http_code}' http://localhost:${params.HOST_PORT})
                    echo "HTTP status: \$STATUS"
                    if [ "\$STATUS" != "200" ]; then
                        echo "❌ Smoke test failed – expected 200 got \$STATUS"
                        exit 1
                    fi
                    echo "✅ Smoke test passed"
                """
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded. Image: ${IMAGE_TAG} running on port ${params.HOST_PORT}."
        }
        failure {
            echo "Pipeline failed. Check logs above."
        }
        always {
            // Clean up dangling images to save disk space
            sh 'docker image prune -f || true'
        }
    }
}
