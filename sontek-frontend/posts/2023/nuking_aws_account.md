---
category: AWS
date: 2023-06-22
tags:
    - AWS
    - DevOps
    - SRE
title: Wiping an AWS Account with aws-nuke
---
When you're an SRE/DevOps engineer you'll end up making AWS accounts and
create a lot of cruft in your sandbox and development accounts. AWS
does not make it easy to clear these up but there is a tool called
[aws-nuke](https://github.com/rebuy-de/aws-nuke) that will do it for you!

# Safe Guards
aws-nuke has a few safeguards in place to prevent inadvertent data loss.
The first of which is it requires you to alias the targetted account. I
like to put `nuke` in the alias to make it clear.

```bash
aws iam create-account-alias --account-alias nuke-<account>
```

The second safe-guard is the config takes a key called `account-blocklist`
that will guarantee nuke will not run against it no matter what. 

The final safety switch it has is it will not take any action by default,
it will only execute a dry-run.   You need to run the CLI with
`--no-dry-run` if you want it to take action.

# Getting Started
You configure `aws-nuke` with YAML, so the first step is to define that:

```
regions:
  - us-east-1
  - global

account-blocklist:
  - "888888888888" # production

accounts:
  "777777777777": {} # nuke-<account>
```

This will prevent us from nuking our production account and target all resources
in the account we actually want to nuke.

You might want to have it nuke *ALL REGIONS* in AWS since you may not know which
regions resources are deployed in.   To do this you can query the regions from AWS:

```bash
❯ aws ec2 describe-regions --all-regions --query "Regions[*].RegionName" --output text | xargs -n 1 | sort

af-south-1
ap-east-1
ap-northeast-1
ap-northeast-2
ap-northeast-3
ap-south-1
ap-south-2
ap-southeast-1
ap-southeast-2
ap-southeast-3
ap-southeast-4
ca-central-1
eu-central-1
eu-central-2
eu-north-1
eu-south-1
eu-south-2
eu-west-1
eu-west-2
eu-west-3
me-central-1
me-south-1
sa-east-1
us-east-1
us-east-2
us-west-1
us-west-2
```

Which would give you an updated config of:

```yaml
regions:
  - global  # Global resources like IAM
  - af-south-1
  - ap-east-1
  - ap-northeast-1
  - ap-northeast-2
  - ap-northeast-3
  - ap-south-1
  - ap-south-2
  - ap-southeast-1
  - ap-southeast-2
  - ap-southeast-3
  - ap-southeast-4
  - ca-central-1
  - eu-central-1
  - eu-central-2
  - eu-north-1
  - eu-south-1
  - eu-south-2
  - eu-west-1
  - eu-west-2
  - eu-west-3
  - me-central-1
  - me-south-1
  - sa-east-1
  - us-east-1
  - us-east-2
  - us-west-1
  - us-west-2
```

I personally don't recommend targetting all AWS regions at the same time.  It
will generate a lot of output and be slow.  You could do it if necessary but
most people only have a few regions they use and so they can set those directly.
For example it, maybe you only use `us-` based regions?


So lets run the dry-run and see what it wants to nuke:

```bash
❯ aws-nuke -c nuke.yaml
```

This should output something like:

```bash
Do you really want to nuke the account with the ID 777777777777 and the alias 'nuke-sandbox'?
Do you want to continue? Enter account alias to continue.
> nuke-sandbox
us-east-1 - EC2Subnet - subnet-0cd9975a443a6304b - [DefaultForAz: "true", DefaultVPC: "true", OwnerID: "777777777777"] - would remove
us-east-1 - EC2Subnet - subnet-0be39d02e399a371c - [DefaultForAz: "true", DefaultVPC: "true", OwnerID: "777777777777"] - would remove
us-east-1 - EC2Subnet - subnet-02d7017bd4730ea63 - [DefaultForAz: "true", DefaultVPC: "true", OwnerID: "777777777777"] - would remove
us-east-1 - EC2Subnet - subnet-0ec04b28c32708ab2 - [DefaultForAz: "true", DefaultVPC: "true", OwnerID: "777777777777"] - would remove
us-east-1 - EC2Subnet - subnet-0eea1b4be084840ed - [DefaultForAz: "true", DefaultVPC: "true", OwnerID: "777777777777"] - would remove
us-east-1 - EC2Subnet - subnet-05a294cc04736012e - [DefaultForAz: "true", DefaultVPC: "true", OwnerID: "777777777777"] - would remove
us-east-1 - EC2RouteTable - rtb-0abda0e94015064ca - [DefaultVPC: "true"] - would remove
us-east-1 - EC2DefaultSecurityGroupRule - sgr-0368525f77bf566ac - [SecurityGroupId: "sg-0a59900b52ced5e10"] - would remove
us-east-1 - EC2DefaultSecurityGroupRule - sgr-0890a837ed6148729 - [SecurityGroupId: "sg-0a59900b52ced5e10"] - would remove
us-east-1 - EC2InternetGatewayAttachment - igw-0acfb474f1fd71375 -> vpc-0be5d310ab44c239a - [DefaultVPC: "true"] - would remove
us-east-1 - SQSQueue - https://sqs.us-east-1.amazonaws.com/777777777777/example-sqs - would remove
global - IAMSAMLProvider - arn:aws:iam::777777777777:saml-provider/AWSSSO_254abb4071f10b25_DO_NOT_DELETE - would remove
global - IAMOpenIDConnectProvider - arn:aws:iam::777777777777:oidc-provider/app.terraform.io - [Arn: "arn:aws:iam::777777777777:oidc-provider/app.terraform.io"] - would remove
global - IAMPolicy - arn:aws:iam::777777777777:policy/tfc-agent-access-policy - [ARN: "arn:aws:iam::777777777777:policy/tfc-agent-access-policy", Name: "tfc-agent-access-policy", Path: "/", PolicyID: "ANPA2T6PZOBNWI76TKQRF"] - would remove
global - IAMRole - tfc-agent - [CreateDate: "2023-04-02T17:55:23Z", LastUsedDate: "2023-06-22T13:45:02Z", Name: "tfc-agent", Path: "/"] - would remove
global - IAMRolePolicyAttachment - tfc-agent -> tfc-agent-access-policy - [PolicyArn: "arn:aws:iam::777777777777:policy/tfc-agent-access-policy", PolicyName: "tfc-agent-access-policy", RoleCreateDate: "2023-04-02T17:55:23Z", RoleLastUsed: "2023-06-22T13:45:02Z", RoleName: "tfc-agent", RolePath: "/"] - would remove
Scan complete: 85 total, 19 nukeable, 66 filtered.

The above resources would be deleted with the supplied configuration. Provide --no-dry-run to actually destroy resources.
```

This is great, it fully scanned the account and found every resource to delete!
It even wants to delete the DefaultVPC which is usually a good idea.  The one
resource that should catch your eye that you probably do not want to delete:

- `arn:aws:iam::777777777777:saml-provider/AWSSSO_254abb4071f10b25_DO_NOT_DELETE`

AWS clearly doesn't want us to delete that!

# Filters
To prevent nuke from deleting resources you want to keep you can define presets
that you use on each account.  So with our SSO example we want to prevent it
from deleting those resources in a preset.

```yaml
presets:
  sso:
    filters:
      IAMSAMLProvider:
      - type: "regex"
        value: "AWSSSO_.*_DO_NOT_DELETE"
      IAMRole:
      - type: "glob"
        value: "AWSReservedSSO_*"
      IAMRolePolicyAttachment:
      - type: "glob"
        value: "AWSReservedSSO_*"
```
You can see in this example I'm targetting specific resource types and then
matching them with both `regex` and `glob` filter types. These are super
powerful but a lot of times the simpler filters can be used.  I start with
`contains` filter and then go from there:

```yaml
      - type: contains
        value: AWSReservedSSO
```

Then the other thing you may have noticed is that I was repeating
`AWSReservedSSO` multiple times.  To reduce that you can use standard YAML
anchors.   So the final config for your preset would look like this:

```yaml
presets:
  sso:
    filters:
      _DEFAULT_FILTERS: &DEFAULT
        - type: "contains"
          value: "DO_NOT_DELETE"
        - type: "contains"
          value: "AWSReservedSSO"

      IAMSAMLProvider: *DEFAULT
      IAMRole: *DEFAULT
      IAMRolePolicyAttachment: *DEFAULT
```
Now we can use that preset in our accounts configuration:

```yaml
accounts:
  "777777777777":
    "presets":
      - sso
```

So your final config should look something like this:

```yaml
regions:
  - us-east-1
  - global

account-blocklist:
  - "888888888888" # production


presets:
  sso:
    filters:
      _DEFAULT_FILTERS: &DEFAULT
        - type: "contains"
          value: "DO_NOT_DELETE"
        - type: "contains"
          value: "AWSReservedSSO"

      IAMSAMLProvider: *DEFAULT
      IAMRole: *DEFAULT
      IAMRolePolicyAttachment: *DEFAULT

accounts:
  "777777777777":
    "presets":
      - sso
```

When you run this you should see now the resources we want to keep are filtered
out:

```bash
global - IAMSAMLProvider - arn:aws:iam::777777777777:saml-provider/AWSSSO_254abb4071f10b25_DO_NOT_DELETE - filtered by config
```

Once you are ready and have your filters in place you can run it for real!

```bash
❯ aws-nuke -c nuke.yaml --no-dry-run
```

# Next steps
One final note about it is that it does not understand the relationship between
resources and so it could try deleting an EBS volume that is still in use by an
EC2 instance.  There isn't a great solution for this outside of running nuke a
few times.

The tool is well documented and so you can find the rest of information going to 
[https://github.com/rebuy-de/aws-nuke](https://github.com/rebuy-de/aws-nuke)!

