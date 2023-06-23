---
category: AWS
date: 2023-04-02
tags:
    - AWS
    - DevOps
    - SRE
title: AWS From Scratch with Terraform - Apply before Merge with Github Actions
---
The two most popular workflows when using terraform are:

- **Apply after Merge**: This is the default for things like
  [terraform cloud](https://terraform.io) and most github actions.

- **Apply before Merge**: This is the default for things like
  [Atlantis](https://www.runatlantis.io/).

I don't like apply-after-merge.  There are a lot of ways where a `plan`
can succeed but an `apply` will fail and you end up with broken configuration
in `main`.

So in this article I'll show you how to implement **apply-before-merge** with
github actions.

If you haven't ready my [previous article](/blog/2023/aws_from_scratch_root_account),
it covers how to setup terraform cloud with apply after merge and bootstrap your AWS
account with terraform.  I will assume you have read that article going forward.

# TL;DR
The code for the github actions we create in this post can be found
[here](https://github.com/sontek/aws-terraform-github-actions) and the code for the
terraform configs can be found [here](https://github.com/sontek/aws-apply-before-merge)

# Repairing the bootstrap
Skip this section if you are starting from scratch following this article.

With apply-before-merge we need to implement it in github actions rather than
utilizing the terraform cloud webhooks.  So lets drop the VCS repo and usage of
the webhook from our github repository. Basically anything that references
`github_oauth_client` can be removed because we will no longer be using OAuth
with Github for our CI/CD pipeline.

```diff
diff --git a/1-variables.tf b/1-variables.tf
index bf1f434..7109924 100644
--- a/1-variables.tf
+++ b/1-variables.tf
@@ -47,12 +47,6 @@ variable "github_default_branch" {
   default     = "main"
 }
 
-variable "github_oauth_client_id" {
-  description = "The token for the TFC OAuth client shown under VCS providers"
-  type        = string
-  default     = null
-}
-
 variable "aws_root_account_id" {
   description = "The AWS root account we want to apply these changes to"
   type        = string
diff --git a/4-tfc.tf b/4-tfc.tf
index a8217b7..9852228 100644
--- a/4-tfc.tf
+++ b/4-tfc.tf
@@ -77,31 +77,12 @@ resource "aws_iam_role_policy_attachment" "tfc-access-attach" {
   policy_arn = aws_iam_policy.tfc-agent.arn
 }
 
-/* Fetch an oauth token from the client */
-data "tfe_oauth_client" "github" {
-  /* Don't fetch the client if we don't have the client_id */
-  count           = var.github_oauth_client_id != null ? 1 : 0
-  oauth_client_id = var.github_oauth_client_id
-}
-
 resource "tfe_workspace" "workspaces" {
   count        = length(var.tfc_workspaces)
   name         = var.tfc_workspaces[count.index]
   organization = tfe_organization.organization.name
 
   working_directory = var.tfc_workspaces[count.index]
-
-  /* This generates a webhook on the github repository so plans are triggered
-  automatically.   We dynamically set the setting because we will not have the
-  oauth client ID on first pass.
-  */
-  dynamic "vcs_repo" {
-    for_each = var.github_oauth_client_id != null ? [var.github_oauth_client_id] : []
-    content {
-      identifier     = format("%s/%s", var.github_organization, github_repository.repo.name)
-      oauth_token_id = data.tfe_oauth_client.github[0].oauth_token_id
-    }
-  }
 }
 
 /* These variables tell the agent to use dynamic credentials */
diff --git a/settings.auto.tfvars.example b/settings.auto.tfvars.example
index 3327f02..79221c1 100644
--- a/settings.auto.tfvars.example
+++ b/settings.auto.tfvars.example
@@ -4,6 +4,5 @@ tfc_workspaces = [
   "root"
 ]
 github_organization    = "github-org"
-github_oauth_client_id = "oc-..."
 github_repo_name       = "my-infra"
 aws_root_account_id    =  "888888888888"
```

Once that is removed from your `infra-bootstrap` repository we need to create
a new github secret with a token for Github to be able to talk with TFC. Make
a new file called `5-github-actions.tf` with the following content:

```hcl
data "tfe_team" "owners" {
  name         = "owners"
  organization = tfe_organization.organization.name
}

resource "tfe_team_token" "github_actions_token" {
  team_id = data.tfe_team.owners.id
}

resource "github_actions_secret" "tfe_secret" {
  repository      = github_repository.repo.name
  secret_name     = "TFE_TOKEN"
  plaintext_value = tfe_team_token.github_actions_token.token
}
```

Then you should `plan` and `apply` the change:

```bash
❯ terraform plan
❯ terraform apply
```

The only change to the infrastructure should be to remove the VCS link and
adding the secret:

```diff
  # tfe_workspace.workspaces[0] will be updated in-place
  ~ resource "tfe_workspace" "workspaces" {
        id                            = "ws-K1M4tdXUUeASgmUR"
        name                          = "root"
        # (20 unchanged attributes hidden)

-       vcs_repo {
-           identifier         = "sontek/sontek-infra" -> null
-           ingress_submodules = false -> null
-           oauth_token_id     = "ot-nMYJRbBb2SH9zCP7" -> null
        }
    }

  # github_actions_secret.tfe_secret will be created
+   resource "github_actions_secret" "tfe_secret" {
+       created_at      = (known after apply)
+       id              = (known after apply)
+       plaintext_value = (sensitive value)
+       repository      = "sontek-infra"
+       secret_name     = "TFE_TOKEN"
+       updated_at      = (known after apply)
    }

  # tfe_team_token.github_actions_token will be created
+   resource "tfe_team_token" "github_actions_token" {
+       id      = (known after apply)
+       team_id = "team-..."
+       token   = (sensitive value)
    }
```

# Github Actions
Now we need to connect the github actions to replace the plan and apply actions
that were being taken by the TFC webhook previously. All of these changes will
be in the `infra` repository that was generated from `bootstrap`.  We are done
with the bootstrap at this point.

First, lets setup the `.github` folder, the end result we want is:

```bash
.github/
└── workflows
    ├── on-apply-finished.yml
    ├── on-pull-request-labeled.yml
    └── on-pull-request.yml
```

So create the folders:

```bash
❯ mkdir -p .github/workflows
❯ terraform apply
```

# On Pull Request
The first flow we'll create is the `terraform plan` workflow which should be
ran whenever a pull request is opened. Create the file
`.github/workflows/on-pull-request.yml` and put this content in it:

```yml
name: pr_build

on:
  pull_request:
    branches:
      - main

env:
  TERRAFORM_CLOUD_TOKENS: app.terraform.io=${{ secrets.TFE_TOKEN }}
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

jobs:
  terraform_validate:
    runs-on: ubuntu-22.04
    strategy:
      fail-fast: false
      matrix:
        folder:
          - root
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: terraform validate
        uses: dflook/terraform-validate@v1
        with:
          path: ${{ matrix.folder }}
          workspace: ${{ matrix.folder }}

  terraform_fmt:
    runs-on: ubuntu-22.04
    strategy:
      fail-fast: false
      matrix:
        folder:
          - root
    steps:
      - uses: actions/checkout@v3

      - name: terraform fmt
        uses: dflook/terraform-fmt-check@v1
        with:
          path: ${{ matrix.folder }}
          workspace: ${{ matrix.folder }}

  terraform_plan:
    runs-on: ubuntu-22.04
    permissions:
      contents: read
      pull-requests: write
    strategy:
      fail-fast: false
      matrix:
        folder:
          - root
    steps:
      - uses: actions/checkout@v3
      - name: terraform plan
        uses: dflook/terraform-plan@v1
        with:
          path: ${{ matrix.folder }}
          workspace: ${{ matrix.folder }}
```

This creates three jobs:

- **terraform_validate**: This validates the terraform via `terraform validate`
  command to make sure that it is correct and doesn't have duplicate resources
  or anything like that.
- **terraform_fmt**: This verifies that the terraform is well formatted by
  running the `terraform fmt` command.`
- **terraform_plan**: This runs the `terraform` plan and comments on the PR a
  diff of the changes for you to verify.


To verify this is working, lets make a change to the infrastructure so that we
can see a plan executed. We can bring back the `SQS` resource we destroyed in
the previous article. Create a file called `root/2-sqs.tf`:

```hcl
resource "aws_sqs_queue" "example-sqs" {
  name                      = "example-sqs"
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
}
```

Lets push a branch and make a pull request to see the result so far:

```bash
❯ git add .github/ root/
❯ git checkout -b apply-before-merge
❯ git commit -m "Implemented on-pull-request"
❯ git push origin head
```

After you make the pull request you should 3 checks on it and a comment that
shows the plan:

<center>
<img src="/images/posts/aws_apply_before_merge/github_comment.png" width="400" />
<img src="/images/posts/aws_apply_before_merge/github_checks.png" width="400" />
</center>

# Apply on Label
So now that the plan is working we need some way to `apply` the changes. I've
found the best way to do this is via a label rather than a comment because of
the way github actions work. Their event based actions like `on-comment` aren't
executed in the context of a pull-request.

Since we will be using a label to signal a plan is ready to be applied lets
create a new file `.github/workflows/on-pull-request-labeled.yml` and provide
this content:

```yaml
name: pr_apply

on:
  pull_request:
    types: [ labeled ]

env:
  TERRAFORM_CLOUD_TOKENS: app.terraform.io=${{ secrets.TFE_TOKEN }}
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

jobs:
  terraform_apply:
    if: ${{ github.event.label.name == 'tfc-apply' }}
    runs-on: ubuntu-22.04
    permissions:
      contents: read
      pull-requests: write
    strategy:
      fail-fast: false
      matrix:
        folder:
          - root
    steps:
      - uses: actions/checkout@v3
      - uses: dflook/terraform-apply@v1
        with:
          path: ${{ matrix.folder }}
          workspace: ${{ matrix.folder }}
```

This will fire whenever a pull request is labeled with the `tfc-apply` label.
It will run the `apply` and update the previous plan comment to let you 
know the status.

<center>
<img src="/images/posts/aws_apply_before_merge/tfc_applying.png" width="400" />
<img src="/images/posts/aws_apply_before_merge/tfc_applying_comment.png" width="400" />
</center>

# Merge on Apply
One thing you'll notice is that the pull request stayed open even after the
infrastructure is applied and we don't want that. We want any changes that have
made it into the environment to be merged into `main` automatically. To do
this we'll create our final action.

Create a new file `.github/workflows/on-apply-finished.yml` with this content:

```yaml
name: pr_merge

# Only trigger, when the build workflow succeeded
on:
  workflow_run:
    workflows: [pr_apply]
    types:
      - completed

jobs:
  merge:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-22.04
    permissions:
      contents: write
      pull-requests: write
      checks: read
      statuses: read
      actions: read
    outputs:
      pullRequestNumber: ${{ steps.workflow-run-info.outputs.pullRequestNumber }}
    steps:
      - name: "Get information about the current run"
        uses: potiuk/get-workflow-origin@v1_5
        id: workflow-run-info
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          sourceRunId: ${{ github.event.workflow_run.id }}

      - name: merge a pull request after terraform apply
        uses: sudo-bot/action-pull-request-merge@v1.2.0
        with:
            github-token: ${{ secrets.GITHUB_TOKEN }}
            number: ${{ steps.workflow-run-info.outputs.pullRequestNumber }}
```

This will wait until the `pr_apply` job completes and as long as it was
successful it'll merge the branch!

**NOTE**: As I mentioned earlier, the event based actions do not run in the
context of the pull request which means you cannot test changes to them during
the PR either.  You must merge the `on-apply-finished.yml` file to `main`
before it starts working.

# Branch Protection
The final step to the process is to make sure you go to your github settings
and make sure these status checks are required before merging. Branch protection
is a feature that will prevent merging changes into a branch unless all
required checks are passing.

Go to `Settings` -> `Branches` -> `Branch Protection` and add a branch
protection rule:

<center>
<img src="/images/posts/aws_apply_before_merge/branch_protection.png" width="500" />
</center>

You want to enable the following settings:

- **Branch Name**: main
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging

Then for `Status checks that are required.` select all of the ones we've
created:

<center>
<img src="/images/posts/aws_apply_before_merge/required_checks.png" height="200" />
</center>

# Next Steps
Now that you have the ability to manage your AWS accounts through terraform
via pull request the next step is to start creating infrastructure that can
create real workloads.   In my next post I'll show you how to boostrap an
EKS (Kubernetes cluster) using terraform.