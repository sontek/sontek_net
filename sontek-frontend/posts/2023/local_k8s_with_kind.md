---
category: Kubernetes
date: 2023-07-21
tags:
    - Linux
    - Kubernetes
    - DevOps
    - SRE
title: Running a kubernetes cluster locally with kind
---
Previously I [showed](/blog/2022/local_kubeadm_cluster) how to run kubernetes
locally with `kubeadm` and VMs but sometimes that is overkill so I wanted to
show how to run [kind](https://kind.sigs.k8s.io/) which is "kuberetes in
docker".

# Creating your first cluster
kind is a very flexible way to run kubernetes locally and allows you to run
single node or multinode clusters while having the flexibility to use all
the features of kubernetes success as ingress.

To create your first cluster it is as simple as running:

```bash
❯ kind create cluster  

Creating cluster "kind" ...
 ✓ Ensuring node image (kindest/node:v1.27.3) 🖼 
 ✓ Preparing nodes 📦  
 ✓ Writing configuration 📜 
 ✓ Starting control-plane 🕹️ 
 ✓ Installing CNI 🔌 
 ✓ Installing StorageClass 💾 
Set kubectl context to "kind-kind"
You can now use your cluster with:

kubectl cluster-info --context kind-kind

Have a question, bug, or feature request? Let us know! https://kind.sigs.k8s.io/#community 🙂
```

You now have a functioning kubernetes cluster and you
can view what it created:

```bash
❯ k get node
NAME                 STATUS   ROLES           AGE     VERSION
kind-control-plane   Ready    control-plane   4m26s   v1.27.3
```

You can also verify that it is running inside docker:

```bash
❯ docker ps
CONTAINER ID   IMAGE                  COMMAND                  CREATED         STATUS         PORTS                       NAMES
1c3ba74dc29b   kindest/node:v1.27.3   "/usr/local/bin/entr…"   3 minutes ago   Up 3 minutes   127.0.0.1:59327->6443/tcp   kind-control-plane
```

# Making the cluster useful
There are a few things you'll notice with the command we ran originally:

- It grabbed the latest kubernetes version available
- It is running a single node cluster
- No ingress available

Luckily kind makes it really easy to customize your local cluster to be what
you want it to be by using a `YAML` configuration.

Create the configuration:
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
- role: worker
- role: worker
```

With this we've now generated a 4 node cluster where we have a single
control-plane and three workers.  Then we defined some extra configuration on
the control-plane:

- **kubeadmConfigPatches**: We want to change the default configuration the
  cluster uses so it'll tag the nodes with the `ingress-ready` label so the
  controller will use them.
- **extraPortMappings**: allow the local host to make requests to the Ingress controller over ports 80/443
- **node-labels**: only allow the ingress controller to run on specific node(s) matching the label selector

So now we can create the new cluster with the configuration. Save that config
as `kind_config.yml` and then run:

```bash
❯ kind create cluster --image kindest/node:v1.25.11 --config kind_config.yml --name kind-multinode
```

This time I've added a few additional flags on the commandline. `--image`
allows us to use a different version of kubernetes and `--name` allows us to
make more than one cluster. So if you didn't destroy the first cluster you'll
see we have two of them now:

```bash
❯ kind get clusters
kind
kind-multinode
```

but `kind` will swap the to the newest cluster by default:

```bash
❯ kubectl config current-context
kind-kind-multinode

❯ kubectl get node
NAME                           STATUS   ROLES           AGE    VERSION
kind-multinode-control-plane   Ready    control-plane   107s   v1.25.11
kind-multinode-worker          Ready    <none>          88s    v1.25.11
kind-multinode-worker2         Ready    <none>          88s    v1.25.11
kind-multinode-worker3         Ready    <none>          88s    v1.25.11
```

Now we need to get the `ingress-nginx` controller installed so we can start
using our cluster with ingress:

```bash
❯ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

The manifests contains `kind` specific patches to forward the hostPorts to the ingress controller, set taint tolerations and schedule it to the custom labelled node.

This will take a little bit of time to get up and running, you can monitor it
by running:

```bash
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

or just manually check the status:

```bash
❯ kubectl get all -n ingress-nginx
NAME                                            READY   STATUS              RESTARTS   AGE
pod/ingress-nginx-admission-create-bbmlc        0/1     Completed           0          68s
pod/ingress-nginx-admission-patch-qlnr8         0/1     Completed           2          68s
pod/ingress-nginx-controller-5f748f78c8-6tc6b   0/1     ContainerCreating   0          68s

NAME                                         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                      AGE
service/ingress-nginx-controller             NodePort    10.96.228.248   <none>        80:31771/TCP,443:31759/TCP   68s
service/ingress-nginx-controller-admission   ClusterIP   10.96.180.126   <none>        443/TCP                      68s

NAME                                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/ingress-nginx-controller   0/1     1            0           68s

NAME                                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/ingress-nginx-controller-5f748f78c8   1         1         0       68s

NAME                                       COMPLETIONS   DURATION   AGE
job.batch/ingress-nginx-admission-create   1/1           22s        68s
job.batch/ingress-nginx-admission-patch    1/1           35s        68s
```

Once `ingress-nginx-controller` is in `Running` state you are read to go!

# Deploying your first app
To prove that the cluster is working correctly we will deploy
[httpbin](https://github.com/Kong/httpbin) which is a nice little API server
so we can prove everything is working.

Create a `httbin.yml` file and paste this into it:

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: httpbin
  labels:
    app: httpbin
    service: httpbin
spec:
  ports:
  - name: http
    port: 8000
    targetPort: 8080
  selector:
    app: httpbin
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin
spec:
  replicas: 2
  selector:
    matchLabels:
      app: httpbin
      version: v1
  template:
    metadata:
      labels:
        app: httpbin
        version: v1
    spec:
      containers:
      - image: docker.io/mccutchen/go-httpbin
        imagePullPolicy: IfNotPresent
        name: httpbin
        ports:
        - containerPort: 8080
```

This is creating a couple of Kubernetes resources:

- `Service`: This is exposing the port to the ingress
- `Deployment`: This is actually launching the service

So we are not using the ingress yet but we can prove that we can launch the
service at least.  So apply those manifests:

```bash
❯ kubectl apply -f httpbin.yml 
service/httpbin created
deployment.apps/httpbin created
```

You should see two pods come up.  You should wait for them to get into the
`Running` status:

```bash
❯ kubectl get pod -o wide
NAME                      READY   STATUS    RESTARTS   AGE   IP           NODE                     NOMINATED NODE   READINESS GATES
httpbin-5c5494967-2z5wz   1/1     Running   0          48s   10.244.3.3   kind-multinode-worker3   <none>           <none>
httpbin-5c5494967-9lf47   1/1     Running   0          72s   10.244.1.2   kind-multinode-worker    <none>           <none>
```

We can now use port forwarding to access it. `httpbin` is exposed on `8000` so
lets create port `9000` on our host that forwards to it:

```bash
❯ kubectl port-forward service/httpbin 9000:8000
Forwarding from 127.0.0.1:9000 -> 80
Forwarding from [::1]:9000 -> 80
```

You can access it via:

```bash
❯ curl localhost:9000/get 
{
  "args": {},
  "headers": {
    "Accept": [
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
    ],
}
```

# Using Ingress
Now to use the ingress rather than port forwarding we create one additional
resource, the `Ingress`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: httpbin-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /httpbin(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: httpbin
            port:
              number: 8000
```

There are a few critical options here.  The first is the annotation to rewrite
the path so it doesn't include `/httpbin/` when it sends the request to the
service and then the `path` and `pathType` so it knows which paths to send to
which service.

Now you should be able to hit your local host and get routed to your
kubernetes service:

```bash
❯ curl localhost/httpbin/get
```

Success!  Now you have a multinode kubernetes cluster that has an ingress
controller!

# Next Steps
The cluster can be used like a production cluster now for local
development!  You could setup Grafana, ArgoCD, etc. to run
inside the cluster.