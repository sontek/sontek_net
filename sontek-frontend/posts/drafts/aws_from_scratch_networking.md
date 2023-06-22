---
category: AWS
date: 2023-04-16
tags:
    - AWS
    - DevOps
    - SRE
title: AWS From Scratch with Terraform - Setting up your VPC and CIDR Ranges
---

- When defining your private and public subnets, they should be a subset of the
CIDR range defined for the VPC.
- Should enable DNS on the VPC by default, somethings require it.
- Don't use default VPC.
- S3 Endpoints
    - https://medium.com/tensult/creating-vpc-endpoint-for-amazon-s3-using-terraform-7a15c840d36f

- AWS has default VPC per region -- AWS creates these.  
    - Comes with a CIDR range 172.31.0.0/16
    - How do you lock down default VPC?
- VPC is regional
- Make one subnet per Availability Zone.

Resources:
- https://www.youtube.com/watch?v=yduHaOj3XMg
