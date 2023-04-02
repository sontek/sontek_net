---
category: AWS
date: 2023-04-01
tags:
    - AWS
    - DevOps
    - SRE
title: AWS From Scratch with Terraform - Setting up your Root Account for IaC (using Terraform Cloud)
---
Starting a new AWS account from scratch can be overwhelming but following this
article will get you setup with an AWS Root (Payer) account that can be
managed through infrastructure as code (IaC) through Terraform.

# What we will do
- Setup a root AWS account that is managed througuh terraform
- Setup OIDC authentication with Terraform Cloud so it can talk to AWS
- Setup Github Actions authentication with Terraform Cloud so we can run plan
  and apply through the CI/CD pipeline.

# Setup AWS Access
It is very bad practice to use the root account for much of anything but for 
bootstrapping the account it is necessary, so the first step is to get your
`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY=` 

To do this click your account and choose `Security Credentials` in the top
right:

<center>
<img src="/images/posts/aws_root_account/security_credentials.png" height="200" />
</center>

Then choose `Create Access key`:

<center>
<img src="/images/posts/aws_root_account/create_access_token.png" width="200" />
</center>

You need to set these environment variables in your shell so that your local
shell has access to AWS. After you set them you can verify you set them correct
by running:

```bash
❯ aws sts get-caller-identity
```

and you should get a result similar to:

```json
{
    "UserId": "777777777777",
    "Account": "888888888888",
    "Arn": "arn:aws:iam::888888888888:root"
}
```

## Bootstrap
Before you can manage any of your accounts through Terraform Cloud you'll need
bootstrap some core infrastructure like OIDC so Terraform Cloud can authenticate
securely and manage AWS Resources on your behalf.

I personally prefer doing this in two repositories:

- `infra-bootstrap`: This repository does the bare minimum to hook up terraform
   cloud with your AWS account and stores the state in git.  Its the only infra
   that will not be controlled by your CI/CD pipeline.

- `infra`: The actual repository where all the rest of your AWS resources are
   managed.  It will store state in Terraform Cloud and you can introduce a
   CI/CD pipeline for approving changes.

After manually creating the git repository `infra-boostrap` in your Github
account We will need 3 providers to bootstrap the account `aws`, `github`, and
`tfe`.

### Variables
Create a `1-variables.tf` where we can define the variables we'll need
   for creating these resources.

```hcl
variable "tfc_aws_audience" {
  type        = string
  default     = "aws.workload.identity"
  description = "The audience value to use in run identity tokens"
}

variable "tfc_hostname" {
  type        = string
  default     = "app.terraform.io"
  description = "The hostname of the TFC or TFE instance you'd like to use with AWS"
}
variable "tfc_project_name" {
  type        = string
  default     = "Default Project"
  description = "The project under which a workspace will be created"
}

variable "tfc_organization_name" {
  type        = string
  description = "The name of your Terraform Cloud organization"
}

variable "tfc_organization_owner" {
  type        = string
  description = "The owner of the TFC organization"
}

variable "tfc_workspaces" {
  type        = list(string)
  description = "The list of TFC workspaces"
}

variable "github_organization" {
  description = "The organization the repositories are owned by"
  type        = string
}

variable "github_default_branch" {
  description = "The default branch to utilize"
  type        = string
  default     = "main"
}
```

We will use these variables in the later modules but they are mostly metadata
around the terraform and github accounts you'll need to setup manually.

### Providers
Create a file called `2-main.tf` and define the providers:

```hcl
terraform {
  required_providers {
    tfe = {
      source  = "hashicorp/tfe"
      version = "0.41.0"
    }

    aws = {
      source  = "hashicorp/aws"
      version = "4.58.0"
    }

    github = {
      source  = "integrations/github"
      version = "5.18.3"
    }
  }
}

provider "aws" {
  region = "us-east-1"

  # Root account, all other accounts should be provisioned
  # via pull requests
  allowed_account_ids = ["888888888888"]
}

provider "github" {
  owner = var.github_organization
}
```

The key things there are we define `allowed_account_ids` to prevent us from
working against any account that isn't the root and we are using one of the
variables we defines earlier.

## Github
We will utilize `terraform` to create the second git repository where the rest
of the infrastructure will go. Create a file called `3-github.tf`:

```hcl
resource "github_repository" "repo" {
  name        = "infra"
  description = "Infrastructure Repository"
  visibility = "private"
  auto_init = true
  has_issues = true
}

resource "github_branch_default" "default" {
  repository = github_repository.repo.name
  branch     = var.github_default_branch
}

output "repository_id" {
  value = github_repository.repo.id
}
```

This will generate a new repository in your account called `infra`.

## Terraform Cloud
Now we need to setup dynamic credentials so the terraform cloud agent is
allowed to take actions on your behalf.   To do this we'll setup an IAM
role and an OIDC provider. Create a file called `4-tfc.tf`:

```hcl
/* AWS will use this TLS certificate to verify that requests for dynamic
credentials come from Terraform Cloud.*/
data "tls_certificate" "tfc_certificate" {
  url = "https://${var.tfc_hostname}"
}

/* sets up an OIDC provider in AWS with Terraform Cloud's TLS certificate,
the SHA1 fingerprint from the TLS certificate 
*/
resource "aws_iam_openid_connect_provider" "tfc_provider" {
  url            = data.tls_certificate.tfc_certificate.url
  client_id_list = [var.tfc_aws_audience]
  thumbprint_list = [
    data.tls_certificate.tfc_certificate.certificates[0].sha1_fingerprint
  ]
}

/* Policy to allow TFC to assume the AWS IAM role in our account */
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.tfc_provider.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "${var.tfc_hostname}:aud"

      values = [
        "${one(aws_iam_openid_connect_provider.tfc_provider.client_id_list)}"
      ]
    }

    condition {
      test     = "StringLike"
      variable = "${var.tfc_hostname}:sub"

      values = [
        for workspace in var.tfc_workspaces : "organization:${var.tfc_organization_name}:project:${var.tfc_project_name}:workspace:${workspace}:run_phase:*"
      ]
    }
    actions = ["sts:AssumeRoleWithWebIdentity"]
  }
}

resource "aws_iam_role" "tfc-agent" {
  name               = "tfc-agent"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

/* Policy for what the TFC agent is allowed to do */
data "aws_iam_policy_document" "tfc-agent" {
  version = "2012-10-17"

  statement {
    actions   = ["*"]
    effect    = "Allow"
    resources = ["*"]
  }
}

resource "aws_iam_policy" "tfc-agent" {
  name        = "tfc-agent-access-policy"
  description = "Access policy for the TFC agent"
  policy      = data.aws_iam_policy_document.tfc-agent.json
}

resource "aws_iam_role_policy_attachment" "tfc-access-attach" {
  role       = aws_iam_role.tfc-agent.name
  policy_arn = aws_iam_policy.tfc-agent.arn
}

resource "tfe_workspace" "workspaces" {
  count        = length(var.tfc_workspaces)
  name         = var.tfc_workspaces[count.index]
  organization = var.tfc_organization_name 

  working_directory = var.tfc_workspaces[count.index]

  /* This generates a webhook on the github repository so plans are triggered
  automatically
  */
  vcs_repo {
    identifier     = format("%s/%s", var.github_organization, var.github_repository_id) 
    oauth_token_id = var.github_oauth_token
  }
}

/* These variables tell the agent to use dynamic credentials */
resource "tfe_variable" "tfc-auth" {
  count        = length(var.tfc_workspaces)
  key          = "TFC_AWS_PROVIDER_AUTH"
  value        = true
  category     = "env"
  workspace_id = tfe_workspace.workspaces[count.index].id
  description  = "Enable dynamic auth on the TFC agents"
}

resource "tfe_variable" "tfc-role" {
  count        = length(var.tfc_workspaces)
  key          = "TFC_AWS_RUN_ROLE_ARN"
  value        = aws_iam_role.tfc-agent.arn
  category     = "env"
  workspace_id = tfe_workspace.workspaces[count.index].id
  description  = "Tell TFC what Role to run as"
}
```


# Helpful Resources
- [Terraform Dynamic Credentials Tutorial](https://developer.hashicorp.com/terraform/tutorials/cloud/dynamic-credentials?product_intent=terraform)
- [Terraform docs on Dynamic Credentials](https://developer.hashicorp.com/terraform/cloud-docs/workspaces/dynamic-provider-credentials/aws-configuration)