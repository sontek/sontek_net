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
❯ multipass launch -c 2 -m 4G -d 10G -n controlplane 22.04
❯ multipass launch -c 2 -m 4G -d 10G -n worker 22.04
❯ multipass list
Name                    State             IPv4             Image
controlplane            Running           192.168.64.7     Ubuntu 22.04 LTS
worker                  Running           192.168.64.8     Ubuntu 22.04 LTS
```
Now we can start working on our controlplane first, lets shell in:

```bash
❯ multipass shell controlplane
```

Lets first add the kubernetes repo to the system so we have access to all the kubernetes tools:

```bash
❯ echo "deb  http://apt.kubernetes.io/  kubernetes-xenial  main" | sudo tee /etc/apt/sources.list.d/kubernetes.list

❯ curl -fsSL  https://packages.cloud.google.com/apt/doc/apt-key.gpg|sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/k8s.gpg
❯ sudo apt-get update && sudo apt-get upgrade -y
```

Now that our system is setup, we can move on to getting a container runtime.

## Getting your Container Runtime!
Before we start pulling in kubernetes components we need to get a container runtime setup on the
machine.   We we are going to use containerd for this purpose.  You can view the docs of for it
[here](https://github.com/containerd/containerd/blob/main/docs/getting-started.md).

Which will download the latest binary and set it up.   I’m going to walk you through how to do it
using the version packaged with Ubuntu which could be older than the latest release.

First thing we want to do is configure the networking to allow iptables to manage:

```bash
❯ cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

❯ cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
EOF

```
We also need to disable some default systemd settings for `rp_filter`  because
they are not compatible with cilium. See the bug report
[here](https://github.com/cilium/cilium/commit/cabc6581b8128681f4ed23f8d6dc463180eea61e)

```bash
❯ sudo sed -i -e '/net.ipv4.conf.*.rp_filter/d' $(grep -ril '\.rp_filter' /etc/sysctl.d/ /usr/lib/sysctl.d/)
❯ sudo sysctl -a | grep '\.rp_filter' | awk '{print $1" = 0"}' | sudo tee -a /etc/sysctl.d/1000-cilium.conf
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

You want to make sure `rp_filter` is `0` everywhere as well for cilium:

```
❯ sudo sysctl -a | grep '\.rp_filter'
net.ipv4.conf.all.rp_filter = 0
net.ipv4.conf.cilium_host.rp_filter = 0
net.ipv4.conf.cilium_net.rp_filter = 0
net.ipv4.conf.cilium_vxlan.rp_filter = 0
net.ipv4.conf.default.rp_filter = 0
net.ipv4.conf.enp0s1.rp_filter = 0
net.ipv4.conf.lo.rp_filter = 0
net.ipv4.conf.lxc0965b7b545f7.rp_filter = 0
net.ipv4.conf.lxcb05ffd84ab74.rp_filter = 0
```

Now lets pull down the container runtime we’ll be using which is containerd.

Ubuntu ships with a very old version of containerd so you need to upgrade to
the version shipped from the docker repos:
You can find which versions are available by running:

```bash
❯ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/docker.gpg
❯ echo "deb https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list
❯ sudo apt-get update
```

```bash
❯ sudo apt-cache madison containerd.io
containerd.io |    1.6.8-1 | https://download.docker.com/linux/ubuntu jammy/stable arm64 Packages
containerd.io |    1.6.7-1 | https://download.docker.com/linux/ubuntu jammy/stable arm64 Packages
containerd.io |    1.6.6-1 | https://download.docker.com/linux/ubuntu jammy/stable arm64 Packages
containerd.io |    1.6.4-1 | https://download.docker.com/linux/ubuntu jammy/stable arm64 Packages
containerd.io |   1.5.11-1 | https://download.docker.com/linux/ubuntu jammy/stable arm64 Packages
containerd.io |   1.5.10-1 | https://download.docker.com/linux/ubuntu jammy/stable arm64 Packages
```

We are going to use the latest version available which was 1.6.8-1
```bash
❯ sudo apt-get install containerd.io=1.6.8-1 -y
```

Then we'll setup a configuration that enables containerd to use the systemd
cgroup.  We are hard coding this config instead of using `containerd config default`
because that currently has had a [bug](https://github.com/containerd/containerd/issues/4574)
for many years that generates an invalid config.

```bash
❯ cat <<EOF | sudo tee /etc/containerd/config.toml
version = 2
[plugins]
  [plugins."io.containerd.grpc.v1.cri"]
   [plugins."io.containerd.grpc.v1.cri".containerd]
      [plugins."io.containerd.grpc.v1.cri".containerd.runtimes]
        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
          runtime_type = "io.containerd.runc.v2"
          [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
            SystemdCgroup = true
EOF

❯ sudo systemctl restart containerd.service
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

Then install the version you want, we install kubelet and kubeadm here to make
sure the versions align:

```bash
❯ sudo apt-get install kubeadm=1.23.5-00 kubelet=1.23.5-00 kubectl=1.23.5-00 -y
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

You can run those on the master node for now, but later I'll show you how to move
the config to your host computer.

Now you should be able to check that your node is not ready yet:

```bash
❯ kubectl get nodes
NAME           STATUS     ROLES                  AGE     VERSION
controlplane   NotReady   control-plane,master   4m16s   v1.23.5
```

*Note*: If you recieve "The connecto to the server was refused" error,
The cluster starting up and getting all the dependencies running could take
a bit of time.  So if you aren't able to communicate right away you can check
which pods are up and running with `crictl`.  You'll need `kube-apiserver` up
and running.  If it isn't you can check:

```bash
❯ sudo crictl --runtime-endpoint=unix:///var/run/containerd/containerd.sock ps -a
CONTAINER           IMAGE               CREATED             STATE               NAME                      ATTEMPT             POD ID              POD
8322192c4605c       bd8cc6d582470       36 seconds ago      Running             kube-proxy                4                   344c4f7fffbe8       kube-proxy-drm46
30ce27c40adb2       81a4a8a4ac639       2 minutes ago       Exited              kube-controller-manager   4                   3a819c3a864b2       kube-controller-manager-controlplane
7709fd5e92898       bd8cc6d582470       2 minutes ago       Exited              kube-proxy                3                   7cc6922c82015       kube-proxy-drm46
10432b81d7c61       3767741e7fba7       2 minutes ago       Exited              kube-apiserver            4                   e64ddf3679d98       kube-apiserver-controlplane
```

which will show you pods that have exited. You can grab the container ID for
kube-apiserver and read its logs:

```bash
❯ sudo crictl --runtime-endpoint=unix:///var/run/containerd/containerd.sock logs 10432b81d7c61
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
❯ curl -fsSL  https://baltocdn.com/helm/signing.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/helm.gpg

❯ sudo apt-get install apt-transport-https --yes

❯ echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list

❯ sudo apt-get update
❯ sudo apt-get install helm
```

Now we can install cilium!  It is *very* important that you pay attention to the
compatibility of cilium with the version of kubernetes you are intstalling. Check
the compatibility list [here](https://docs.cilium.io/en/v1.12/concepts/kubernetes/compatibility/).

```bash
❯ helm repo add cilium https://helm.cilium.io/
❯ helm repo update
```
Once the repo is added you can list the versions available:

```bash
❯ helm search repo -l|head -n8
NAME           	CHART VERSION	APP VERSION	DESCRIPTION
cilium/cilium  	1.12.1       	1.12.1     	eBPF-based Networking, Security, and Observability
cilium/cilium  	1.12.0       	1.12.0     	eBPF-based Networking, Security, and Observability
cilium/cilium  	1.11.8       	1.11.8     	eBPF-based Networking, Security, and Observability
cilium/cilium  	1.11.7       	1.11.7     	eBPF-based Networking, Security, and Observability
cilium/cilium  	1.11.6       	1.11.6     	eBPF-based Networking, Security, and Observability
cilium/cilium  	1.11.5       	1.11.5     	eBPF-based Networking, Security, and Observability
cilium/cilium  	1.11.4       	1.11.4     	eBPF-based Networking, Security, and Observability
```

So we want `1.11.4`:

```bash
❯ helm install cilium cilium/cilium --namespace kube-system --version 1.11.4
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
❯ curl -fsSL  https://packages.cloud.google.com/apt/doc/apt-key.gpg|sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/k8s.gpg
❯ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/docker.gpg
❯ echo "deb https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list

❯ cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

❯ sudo sed -i -e '/net.ipv4.conf.*.rp_filter/d' $(grep -ril '\.rp_filter' /etc/sysctl.d/ /usr/lib/sysctl.d/)
❯ sudo sysctl -a | grep '\.rp_filter' | awk '{print $1" = 0"}' | sudo tee -a /etc/sysctl.d/1000-cilium.conf

❯ cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
EOF

❯ sudo systemctl restart systemd-modules-load
❯ sudo sysctl --system

❯ sudo apt-get update && sudo apt-get upgrade -y
❯ sudo apt-get install containerd.io=1.6.8-1 -y

❯ cat <<EOF | sudo tee /etc/containerd/config.toml
version = 2
[plugins]
  [plugins."io.containerd.grpc.v1.cri"]
   [plugins."io.containerd.grpc.v1.cri".containerd]
      [plugins."io.containerd.grpc.v1.cri".containerd.runtimes]
        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
          runtime_type = "io.containerd.runc.v2"
          [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
            SystemdCgroup = true
EOF

❯ sudo systemctl restart containerd.service
❯ sudo apt-get install kubeadm=1.23.5-00 kubelet=1.23.5-00 kubectl=1.23.5-00 -y

```

From there we should be ready to join the cluster.   When we ran `kubeadm init` previously it
printed a join command out that we could use but I’m going to show you how to do it if you
were coming back later and no longer had that token.

Back on the *controplane* node run:

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

```bash
multipass transfer controlplane:/home/ubuntu/.kube/config local.config
```

Normally kubernetes configuration is in ~/.kube/config but I like to maint a separate file for
each cluster and then I set the `KUBECONFIG` env var to access it. 

```bash
❯ export KUBECONFIG=local.config
❯ kubectl get nodes
NAME           STATUS   ROLES                  AGE   VERSION
controlplane   Ready    control-plane,master   56m   v1.23.5
worker         Ready    <none>                 11m   v1.23.5
```



