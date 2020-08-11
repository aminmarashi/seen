helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm install cde-jenkins --values jenkins.yaml stable/jenkins

# SERVICE_IP=$(kubectl get svc --namespace default cde-jenkins --template "{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}")
# echo "Jenkins URL: http://$SERVICE_IP/"
# echo Username: user
# echo Password: $(kubectl get secret --namespace default cde-jenkins -o jsonpath="{.data.jenkins-password}" | base64 --decode)
