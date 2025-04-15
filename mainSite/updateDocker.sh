aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 390403879619.dkr.ecr.eu-central-1.amazonaws.com
docker build -t clout/frontend_service .
docker tag clout/frontend_service:latest 390403879619.dkr.ecr.eu-central-1.amazonaws.com/clout/frontend_service:latest
docker push 390403879619.dkr.ecr.eu-central-1.amazonaws.com/clout/frontend_service:latest
