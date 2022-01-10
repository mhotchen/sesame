provider "aws" {
  region = "eu-west-2"
}

terraform {
  required_version = ">= 1.1"
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }

  backend "s3" {
    region         = "eu-west-2"
    encrypt        = true
    bucket         = "4b2f6cfe-a36b-4bdb-8fb9-656003191a39"
    dynamodb_table = "terraform-state-lock"
    key            = "terraform.tfstate"
  }
}

resource "aws_s3_bucket" "terraform-state" {
  bucket = "4b2f6cfe-a36b-4bdb-8fb9-656003191a39"
  acl    = "private"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_dynamodb_table" "terraform-state-lock" {
  name           = "sesame-state-lock"
  hash_key       = "LockID"
  read_capacity  = 1
  write_capacity = 1

  attribute {
    name = "LockID"
    type = "S"
  }
}