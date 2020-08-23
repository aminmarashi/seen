CONFIG_LOC=/tmp/kubeconfig
aws eks update-kubeconfig --kubeconfig $CONFIG_LOC --region us-west-2 --name eks-cluster
kubectl --kubeconfig $CONFIG_LOC apply -f admin.yaml
