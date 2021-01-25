# Seen

## Start the script

Please make sure `Docker` and `docker-compose` are both installed and are
running correctly.

```bash
./start.sh
```

The above script will run the database and the app locally in two containers,
the app is bound to localhost:8080 by default, you can change that in the
`docker-compose` file.

## Pages

### /create/test-image.png

Create a transparent pixel that will be tracked on visit

URL: `[host]/create/test-image.png`

Click on copy button to copy the image element and paste it anywhere (including
email).

Or just visit the newly created image by clicking on the link.

### /test-image.png

URL: `[host]/test-image.png`

To access the image, your access will be logged and will be shown under
`/stats`

### /stats

Shows the logs of visits to every image

URL: `[host]/stats`
