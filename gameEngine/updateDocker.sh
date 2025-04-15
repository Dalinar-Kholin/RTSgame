aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 390403879619.dkr.ecr.eu-central-1.amazonaws.com
docker build -t cloud/game_engine .
docker tag cloud/game_engine:latest 390403879619.dkr.ecr.eu-central-1.amazonaws.com/cloud/game_engine:latest
docker push 390403879619.dkr.ecr.eu-central-1.amazonaws.com/cloud/game_engine:latest
