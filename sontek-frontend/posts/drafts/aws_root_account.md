---
category: DevOps
date: 2022-02-18
tags:
    - Linux
    - AWS
title: Best practices with your AWS account
---

- Root Account
  - Use MFA. 
  - Delete all access keys on root account
  - Setup a notification whenever a root login is executed.
    - EventBridge + SNS
  - Setup a billing alert (make it what you don't want it to be)

- Don't use Root Account for much.
  - https://docs.aws.amazon.com/accounts/latest/reference/root-user-tasks.html

- Use AWS SSO
- https://www.youtube.com/watch?v=9hZWPkIZxPw

- SOC2 recommendations:
  - https://www.linkedin.com/pulse/aws-best-practices-successful-soc-2-audit-troy/