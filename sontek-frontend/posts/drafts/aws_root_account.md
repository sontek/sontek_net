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

- Use AWS SSO
- https://www.youtube.com/watch?v=9hZWPkIZxPw