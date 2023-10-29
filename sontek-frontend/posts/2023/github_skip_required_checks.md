---
category: Development
date: 2023-10-29
tags:
    - git
    - github
title: Speed up github actions with conditional jobs, even with required checks
---
Having every github action run on every pull request will end up slowing you
down and sometimes even discourage you from making changes.  For example, if you
see an error in the `README.md` but you know you'll have to wait for the entire
test suite to run you may choose not to push the change.

# Path Filtering
To address this problem, Github has a feature called [path filtering](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore)
which works really well!  You can include and exclude paths with a simple syntax:

```yaml
on:
  pull_request:
    paths:
      - '*'
      - '*/**'
      - '!README.md'
      - '!.gitignore'
```

Which will run on any changes except for `README.md` and `.gitignore`.  There is
even a simpler format to this by using `paths-ignore`:

```yaml
on:
  pull_request:
    paths-ignore:
      - 'README.md'
      - '.gitignore'
```

Although the path filtering feature of github works, I do not recommend using
it because it has some critical issues that I'll talk about below!

# Branch Protection / Required Checks
Path Filtering has one major flaw which is that it skips the run of the job
completely which means if you are using [branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
your PR will be stuck in `pending` state.

To resolve this we will have to run the job, but skip the actions inside it that
are slow conditionally. There are a few opensource actions out there that make
this easy but the one I recommend is:

[https://github.com/tj-actions/changed-files](https://github.com/tj-actions/changed-files)

It creates a lot of useful outputs you can use in your conditional out of the box
which makes your action easy to write.

# Skipping a required check
So using `tj-actions/changed-files` to skip a required check, it will look very
similar to the path filtering from github.  You first define what files you care
about:

```yaml
jobs:
  terraform-lint: 
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v3
      - name: Check if files changed
        id: changed-files-yaml
        uses: tj-actions/changed-files@v40
        with:
          files_yaml: |
            src:
              - '*'
              - '*/**'
              - '!README.md'
              - '!.gitignore'
```
The `src` is just a key selection I made here.  You can have many groups of
files like `tests`, `docs`, etc. and conditionally do things if each of them
changed.

So from our example, this step will generate output we can use `steps.changed-files-yaml.outputs.src_any_changed`
that is either `true` or `false.`. To use this we can us the `if` conditional
block on our jobs.

```yaml
steps:
    - if: steps.changed-files-yaml.outputs.src_any_changed == 'true'
    run: |
        earthly \
        +ci-terraform-lint \
            --TERRAFORM_VERSION=${{ env.RTX_TERRAFORM_VERSION }}
```

This will then skip linting if we didn't change any terraform and the job will
be marked successful!

<center>
<img src="/images/posts/github_skip_required_checks/skipped_checks.png" />
</center>

This can be confusing sometimes and the people you work with (or future you!)
may wonder why these critical checks are being skipped.   I like to include
a message with the decision that was made so its obvious that we wanted to skip
them:

```yaml
- if: steps.changed-files-yaml.outputs.src_any_changed == 'false'
  run: |
    echo "No terraform files changed"
```

Which will output:

```
✅ "No terraform files changed"
```

Right next to the skipped job which is exactly what we wanted to see! So the end
result would look something like this:

```yaml
on:
  pull_request:
    
jobs:
  terraform-lint: 
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v3
      - name: Check if real files changed
        id: changed-files-yaml
        uses: tj-actions/changed-files@v40
        with:
          files_yaml: |
            src:
              - '*'
              - '*/**'
              - '!README.md'
              - '!.gitignore'

      - if: steps.changed-files-yaml.outputs.src_any_changed == 'true'
        run: |
          earthly \
            +ci-terraform-lint \
              --TERRAFORM_VERSION=${{ env.RTX_TERRAFORM_VERSION }}

      - if: steps.changed-files-yaml.outputs.src_any_changed == 'false'
        run: |
          echo "No terraform files changed"
```

# Conclusion
Hopefully with this you can start speeding up your github actions and making the
developer experience enjoyable!
