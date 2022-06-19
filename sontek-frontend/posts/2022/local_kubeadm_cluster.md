---
category: kubernetes
date: 2022-04-17
tags:
    - linux
    - kubernetes
    - devops
title: Running a kubernetes cluster locally with kubeadm
---

I’m going to show you how to get a real kubernetes cluster setup locally on top of virtual
machines!  I’ll be using multipass but feel free to use virtualbox, proxmox, or whatever your
favorite cloud provider is.

kubeadm a production ready kubernetes install tool and I prefer to use it over minikube, kind,
etc. because it gives you a more real world experience for *managing* the kubernetes cluster. 
This isn’t important if you are a user of the cluster but if you have to run your own this is
a great way to gain some daily experience.


The kubernetes documentation on kubeadm is great and you can find it [here](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/).


The differences between this blog and the kubernetes docs is that they leave a lot of decisions
up to the reader such as:
- choosing a container runtime
- Selecting and installing a CNI (container network interface)

I’m going to be opinionated and make specific technology decisions such as using containerd and
cilium so that you don't have to think about those decisions.

## Getting your Virtual Machines setup!
The minimum requirements for a control plane node in kubernetes is 2gb of RAM and 2 CPUs.  Since
we actually want to be able to schedule workloads on the workers afterwards we are going to setup
a cluster that looks like this:

- Control Plane: 2gb RAM, 2 CPU
- Worker: 4gb RAM, 2 CPU

Since we’ll be using multipass to launch the nodes, we can do that now:

```bash
❯ multipass launch -c 2 -m 2G -d 10G -n controlplane
❯ multipass launch -c 2 -m 4G -d 10G -n worker
❯ multipass list
Name                    State             IPv4             Image
controlplane            Running           192.168.64.7     Ubuntu 20.04 LTS
worker                  Running           192.168.64.8     Ubuntu 20.04 LTS
```
Now we can start working on our controlplane first, lets shell in:

```bash
❯ multipass shell controlplane
```

Lets first add the kubernetes repo to the system so we have access to all the kubernetes tools:

```bash
❯ echo "deb  http://apt.kubernetes.io/  kubernetes-xenial  main" | sudo tee /etc/apt/sources.list.d/kubernetes.list

❯ curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
❯ sudo apt-get update && sudo apt-get upgrade -y
```

Now that our system is setup, we can move on to getting a container runtime.

## Getting your Container Runtime!
Before we start pulling in kubernetes components we need to get a container runtime setup on the
machine.   We we are going to use containerd for this purpose.  You can view the docs of for it
here:

https://containerd.io/docs/getting-started/#starting-containerd

Which will download the latest binary and set it up.   I’m going to walk you through how to do it
using the version packaged with Ubuntu which could be older than the latest release.

First thing we want to do is configure the networking to allow iptables to manage:

```bash
❯ cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

❯ cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
EOF

```
Then we need to refresh sysctl so those settings are applied:

```bash
❯ sudo systemctl restart systemd-modules-load
❯ sudo sysctl --system
```

You should see it applying all the changes:

```
* Applying /etc/sysctl.d/k8s.conf ...
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
```

If you do not, the netfilter module may not have loaded properly:

```bash
❯ lsmod |grep br_netfilter
br_netfilter           28672  0
bridge                176128  1 br_netfilter
```

Now lets pull down the container runtime we’ll be using which is containerd.  You can
find which versions are available by running:


```bash
❯ sudo apt-cache madison containerd
containerd | 1.5.5-0ubuntu3~20.04.2 | http://archive.ubuntu.com/ubuntu focal-updates/main amd64 Packages
containerd | 1.5.5-0ubuntu3~20.04.2 | http://security.ubuntu.com/ubuntu focal-security/main amd64 Packages
containerd | 1.3.3-0ubuntu2 | http://archive.ubuntu.com/ubuntu focal/main amd64 Packages
```

We are going to use the latest version available which was 1.5.5. 
```bash
❯ sudo apt-get install containerd=1.5.5-0ubuntu3~20.04.2 -y
```

You can verify its running with ctr:
```bash
❯ sudo ctr --address /var/run/containerd/containerd.sock containers list
CONTAINER    IMAGE    RUNTIME
```

Now that this is working we can move on to getting kubernetes installed!

## Using kubeadm!

Now we need to get the kubernetes tools installed onto the system.  I’m going to be using 1.23
but to find the latest version you can run:

```bash
❯ sudo apt-cache madison kubeadm|head -n2
   kubeadm |  1.23.5-00 | http://apt.kubernetes.io kubernetes-xenial/main amd64 Packages
   kubeadm |  1.23.4-00 | http://apt.kubernetes.io kubernetes-xenial/main amd64 Packages
```

Then install the version you want:

```bash
❯ sudo apt-get install kubeadm=1.23.5-00 -y
```

This will pull in a few tools, including an alternative to `ctr` that we used earlier called
`crictl`.  You can check that it is available to you doing this:

```bash
❯ sudo crictl --runtime-endpoint=unix:///var/run/containerd/containerd.sock ps
```

We can finally init our cluster:

```bash
❯ sudo kubeadm init
```

Once that finishes running it should give you some tips setup your configuration, it should look like this: 

```bash
❯ mkdir -p $HOME/.kube
❯ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
❯ sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Now you should be able to check that your node is not ready yet:

```bash
❯ kubectl get nodes
NAME           STATUS     ROLES                  AGE     VERSION
controlplane   NotReady   control-plane,master   4m16s   v1.23.5
```

There are a few ways to figure out why the node isn’t ready yet.  Usually I would check the
`kubelet` logs first:

```bash
❯ sudo journalctl -flu kubelet
-- Logs begin at Sun 2022-04-17 19:22:19 AST. --
Apr 17 20:53:15 controlplane kubelet[19727]: E0417 20:53:15.951350   19727 kubelet.go:2347] "Container runtime network not ready" networkReady="NetworkReady=false reason:NetworkPluginNotReady message:Network plugin returns error: cni plugin not initialized"
Apr 17 20:53:20 controlplane kubelet[19727]: E0417 20:53:20.952148   19727 kubelet.go:2347] "Container runtime network not ready" networkReady="NetworkReady=false reason:NetworkPluginNotReady message:Network plugin returns error: cni plugin not initialized"
```

It is clear the problem is that we are missing the CNI.  The other way you can find out what is
going on is describing the node:

```bash
❯ kubectl describe node controlplane
```

This will have a lot of information but if you scroll through there looking at `Reason` you
might see something useful.  In this case under `Lease` you would see:

```bash
❯ kubectl describe node controlplane|grep NotReady
Ready            False   Sun, 17 Apr 2022 20:53:37 -0400   Sun, 17 Apr 2022 20:43:07 -0400   KubeletNotReady              container runtime network not ready: NetworkReady=false reason:NetworkPluginNotReady message:Network plugin returns error: cni plugin not initialize
```

Lets get our CNI installed, we’ll be using cilium!

## Setting up your CNI!
Cilium has great documentation over [here](https://docs.cilium.io/en/v1.9/gettingstarted/k8s-install-kubeadm/),
but I’ll walk you through it anyways.  I do recommend checking out their documentation so you
are familiar with it.   We will use `helm` to pull down the version of cilium we want:

```bash
❯ curl https://baltocdn.com/helm/signing.asc | sudo apt-key add -
❯ sudo apt-get install apt-transport-https --yes

❯ echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list

❯ sudo apt-get update
❯ sudo apt-get install helm
```

Now we can install cilium:

```bash
❯ helm repo add cilium https://helm.cilium.io/
❯ helm repo update
```
Once the repo is added you can list the versions available:

```bash
❯ helm search repo
NAME         	CHART VERSION	APP VERSION	DESCRIPTION
cilium/cilium	1.11.3       	1.11.3     	eBPF-based Networking, Security, and Observability
```

So we want `1.11.3`:

```bash
❯ helm install cilium cilium/cilium --version 1.11.3 --namespace kube-system
```

Now our node should be ready!

```bash
❯ kubectl get node
NAME           STATUS   ROLES                  AGE   VERSION
controlplane   Ready    control-plane,master   24m   v1.23.5
```

Time to join our worker to the cluster!

## Joining a worker to the cluster!
We have to go through the same steps as the controlplane to get the point that we have a
container runtime and `kubeadm`.   I’m not going to talk about the commands a second time but
I’ll re-iterate them here for ease of following along.

First open up another shell and connect to the worker:

```bash
❯ multipass shell worker
```

Now run the following commands:

```bash
❯ echo "deb  http://apt.kubernetes.io/  kubernetes-xenial  main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
❯ curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
❯ echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
❯ curl https://baltocdn.com/helm/signing.asc | sudo apt-key add -
❯ sudo apt-get update && sudo apt-get upgrade -y
❯ cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF
❯ cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables   = 1
net.ipv4.ip_forward                        = 1
EOF
❯ sudo systemctl restart systemd-modules-load
❯ sudo sysctl --system
❯ sudo apt-get install containerd=1.5.5-0ubuntu3~20.04.2 apt-transport-https helm kubeadm=1.23.5-00 -y 
```

From there we should be ready to join the cluster.   When we ran `kubeadm init` previously it
printed a join command out that we could use but I’m going to show you how to do it if you
were coming back later and no longer had that token.

First, on the controplane node run:

```bash
❯ kubeadm token create --print-join-command
kubeadm join 192.168.64.7:6443 --token wxs197.cco6mjj9ricvu8ov --discovery-token-ca-cert-hash sha256:bd01c065240fa76f30a02ecb70a8cea6e329c9678994d4da1f6ccac7694b97fb
```

Now copy that command and run it with `sudo` on the worker:

```bash
❯ sudo kubeadm join 192.168.64.7:6443 --token wxs197.cco6mjj9ricvu8ov --discovery-token-ca-cert-hash sha256:bd01c065240fa76f30a02ecb70a8cea6e329c9678994d4da1f6ccac7694b97fb
```

After this completes it’ll take a minute or two for everything to be synced up but if you go
back to the master node you should have 2 ready nodes now:

```bash
❯ kubectl get nodes
NAME           STATUS   ROLES                  AGE   VERSION
controlplane   Ready    control-plane,master   46m   v1.23.5
worker         Ready    <none>                 79s   v1.23.5
```

## Accessing the cluster outside of the VMs!
Now the final part is to get the `admin.conf` as a kubeconfig on your machine so you can control
it from outside of the cluster.   To do this we can use scp

multipass transfer controlplane:/home/ubuntu/.kube/config local.config

Normally kubernetes configuration is in ~/.kube/config but I like to maint a separate file for
each cluster and then I set the `KUBECONFIG` env var to access it. 

```bash
❯ export KUBECONFIG=local.config
❯ kubectl get nodes
NAME           STATUS   ROLES                  AGE   VERSION
controlplane   Ready    control-plane,master   56m   v1.23.5
worker         Ready    <none>                 11m   v1.23.5
```



