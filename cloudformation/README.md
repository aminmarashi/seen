# Create a cluster

Run

```
./create.sh
```

Follow the progress in the AWS Cloudformation tool. After cluster is
successfully created add a kubeconfig to start using K8s. Make sure to be
installing the latest version of awscli using `pip`.

```
./create_kubeconfig.sh
```

# Delete the stack

Make sure all the K8s resources are down, use the `delete.sh` script in `k8s`
folder if not, then run:

```
./delete.sh
```
