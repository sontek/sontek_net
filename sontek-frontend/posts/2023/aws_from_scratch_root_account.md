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
`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` 

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

variable "github_repo_name" {
  description = "The name of the git reppository we'll create for managing infra"
  type        = string
}

variable "github_default_branch" {
  description = "The default branch to utilize"
  type        = string
  default     = "main"
}

variable "github_oauth_client_id" {
  description = "The token for the TFC OAuth client shown under VCS providers"
  type        = string
  default     = null
}

variable "aws_root_account_id" {
  description = "The AWS root account we want to apply these changes to"
  type        = string
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
  allowed_account_ids = [var.aws_root_account_id]
}

provider "github" {
  owner = var.github_organization
}
```

The key things there are we define `allowed_account_ids` to prevent us from
working against any account that isn't the root and we are using one of the
variables we defines earlier.

### Github
We will utilize `terraform` to create the second git repository where the rest
of the infrastructure will go. Create a file called `3-github.tf`:

```hcl
resource "github_repository" "repo" {
  name        = var.github_repo_name
  description = "Infrastructure Repository"
  visibility  = "private"
  auto_init   = true
  has_issues  = true
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

### Terraform Cloud
Now we need to setup dynamic credentials so the terraform cloud agent is
allowed to take actions on your behalf.   To do this we'll setup an IAM
role and an OIDC provider. Create a file called `4-tfc.tf`:

```hcl
resource "tfe_organization" "organization" {
  name  = var.tfc_organization_name
  email = var.tfc_organization_owner
}

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
        for workspace in var.tfc_workspaces : "organization:${tfe_organization.organization.name}:project:${var.tfc_project_name}:workspace:${workspace}:run_phase:*"
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

/* Fetch an oauth token from the client */
data "tfe_oauth_client" "github" {
  /* Don't fetch the client if we don't have the client_id */
  count           = var.github_oauth_client_id != null ? 1 : 0
  oauth_client_id = var.github_oauth_client_id
}

resource "tfe_workspace" "workspaces" {
  count        = length(var.tfc_workspaces)
  name         = var.tfc_workspaces[count.index]
  organization = tfe_organization.organization.name

  working_directory = var.tfc_workspaces[count.index]

  /* This generates a webhook on the github repository so plans are triggered
  automatically.   We dynamically set the setting because we will not have the
  oauth client ID on first pass.
  */
  dynamic "vcs_repo" {
    for_each = var.github_oauth_client_id != null ? [var.github_oauth_client_id] : []
    content {
      identifier     = format("%s/%s", var.github_organization, github_repository.repo.name)
      oauth_token_id = data.tfe_oauth_client.github[0].oauth_token_id
    }
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

This module is dynamic because there is one piece that will require a
manul oauth setup for github.  So the first pass will apply without it
and then later on we'll create it and run the apply again.

## Applying the changes
Now we just need to define our settings for the module and we'll get our
infrastructure applied.  Create a file called `settings.auto.tfvars` and
populate it with the content for your account.  This is an example of what
this should look like:

```hcl
tfc_organization_name  = "sontek"
tfc_organization_owner = "john@sontek.net"

# The workspaces you want to create and be able to manage with IaC
tfc_workspaces = [
  "root"
]
# this can be your username
github_organization    = "sontek"
github_repo_name       = "sontek-infra"
aws_root_account_id    =  "888888888888"
```

Now run:

```bash
❯ terraform login
❯ terraform init
```

and you should see:

```
Terraform has been successfully initialized!
```

Now lets run our plan:

```
❯ terraform plan
```

You should see a result:

```
Plan: 10 to add, 0 to change, 0 to destroy.
```

Apply it to make those resources:

```
❯ terraform apply
```

At this point it:

1. Created a terraform cloud organization
2. Created a terraform cloud workspace
3. Created a git repository

# Verify TFC can talk to AWS
To verify that TFC can communicate with AWS through the dynamic credentials,
lets clone the repository and make some dummy resources. After you've cloned
the repository lets make a folder for the workspace `root` that we defined in
bootstrap:

```bash
❯ mkdir root
❯ cd root
```

Now create a `1-providers.tf`:

```hcl
terraform {
  cloud {
    organization = "sontek"

    workspaces {
      name = "root"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.58.0"
    }

    tfe = {
      source  = "hashicorp/tfe"
      version = "0.42.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Owner   = "john@sontek.net"
      Env     = "Root"
      Service = "BusinessOperations"
    }
  }
}
```
**NOTE**: You should replace `organization`, `workspaces.name`, and
`tags.Owner` to be your own values.

Now create a small resource to prove everything is working, we'll use SQS for
this. Create a file called `2-sqs.tf`:

```hcl
resource "aws_sqs_queue" "example-sqs" {
  name                        = "example-sqs"
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
}
```

If you run the plan you should see the resource it wants to create:

```bash
❯ terraform init
❯ terraform plan

```

and you should see the run is executing in terraform cloud:
```
Running plan in Terraform Cloud. Output will stream here. Pressing Ctrl-C
will stop streaming the logs, but will not stop the plan running remotely.
```

You can click the link it provides to see the logs. Now lets apply this
resource to see it all working:

```
❯ terraform apply
```

You should get a response like:

```
Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

So Terraform Cloud has full access to create AWS resources!   The final step
is to get github running the plan/apply on pull requests. Commit these files
to your repository and we'll remove them in a pull request. Create a
`.gitignore` file in the root:

```
.terraform*
```

and commit all the files:

```bash
❯ git add *
❯ git commit -m "initial infra"
❯ git push origin head
```

# Github VCS Provider
To setup oauth between github and terraform cloud so it can manage the webhooks
you need to login to the [https://app.terraform.io](Terraform Cloud Console) and
initiate the connection.

Select the newly created organization and then click `Settings`.  In the sidebar
there will be a section `Version Control` and you want to select `Providers` under
that.

At this point you should see an `Add a VCS Provider` button, you want to select
`Github.com (Custom)`:

<center>
<img src="/images/posts/aws_root_account/tfc_vcs_provider.png" height="250" />
</center>

Follow the on-screen instructions to create a new GitHub OAuth application on your
account. For me, I went to [here](https://github.com/settings/applications/new) and
provided the information TFC displayed:

<center>
<img src="/images/posts/aws_root_account/tfc_github_app.png" height="300" />
</center>

On the Github side you need to save the `Client ID` and you need to click
`Generate a new client secret`.   Provide those details to terraform cloud and
then we should be ready to send our first PR!

<center>
<img src="/images/posts/aws_root_account/tfc_oauth_settings.png" height="300" />
</center>

## Finish Bootstrap
At this point we need to return to the bootstrap repository and provide it the
new OAuth Client ID for its `github_oauth_client_id` setting.  To get the value
for this the easiest way is to drill into the VCS provider in terraform and click
`Edit Client`.   In the URL you'll see the Client ID, it should start with
`oc-...`.

Now return back to the `bootstrap` repository and edit `settings.auto.tfvars` and
set the final setting:

```
github_oauth_client_id = "oc-......"
```

Now you should be able to run a plan and see the `vcs_repo` get added in-place:

```bash
❯ terraform plan

  ~ update in-place

Terraform will perform the following actions:

  # tfe_workspace.workspaces[0] will be updated in-place
  ~ resource "tfe_workspace" "workspaces" {
        id                            = "ws-..."
        name                          = "root"
        # (20 unchanged attributes hidden)

      + vcs_repo {
          + identifier         = "sontek/sontek-infra"
          + ingress_submodules = false
          + oauth_token_id     = "ot-..."
        }
    }

Plan: 0 to add, 1 to change, 0 to destroy.
```

Apply the change!

```
❯ terraform apply
```

After you apply the change, if you go to `Settings` -> `Webhooks` of the `infra`
repository that was created earlier you should see a new terraform cloud webhook
was created.

<center>
<img src="/images/posts/aws_root_account/github_webhooks.png" width="350" />
</center>

# Send your first pull request
Now you should be able to send a pull request tearing down the SQS resource we
generated at the beginning and terraform cloud will take care of the rest!
When you merge it will apply the changes.

# Helpful Resources
- [Terraform Dynamic Credentials Tutorial](https://developer.hashicorp.com/terraform/tutorials/cloud/dynamic-credentials?product_intent=terraform)
- [Terraform docs on Dynamic Credentials](https://developer.hashicorp.com/terraform/cloud-docs/workspaces/dynamic-provider-credentials/aws-configuration)