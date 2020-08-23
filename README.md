# Cde Capstone

To create a cluster using cloudformation and set up kubernetes config locally:

```
cd cloudformation
./create.sh
```

Visit the automatically generated domain to login to Jenkins and add the github
project.

Docker image is uploaded to `marashisamin/read-receipt`

## How to use the project

Visit the load balancer URL

```
kubectl --kubeconfig /tmp/kubeconfig get svc read-receipt-lb
```

### /create/test-image.png

Create a transparent pixel that will be tracked on visit

URL: `http://[auto generated].us-west-2.elb.amazonaws.com/create/test-image.png`

Click on copy button to copy the image element and paste it anywhere (including
email).

Or just visit the newly created image by clicking on the link.

### /test-image.png

URL: `http://[auto generated].us-west-2.elb.amazonaws.com/test-image.png`

To access the image, your access will be logged and will be shown under
`/stats`

### /stats

Shows the logs of visits to every image

URL: `http://[auto generated].us-west-2.elb.amazonaws.com/stats`
