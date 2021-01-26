export SECRET="$1"
if [ -z "$SECRET" ]; then
    echo 'Please provide a secret'
    exit 1;
fi
docker-compose up --build -d
docker-compose logs -f
