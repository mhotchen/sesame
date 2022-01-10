# Overview

This service uses terraform to manage my AWS infrastructure. Every single change to my AWS account has been done through
these files and is reproducible, deletable, and in version control exactly as is the case for code.

# Before making changes

First follow the parent instructions.

Then install the [Terraform](https://www.terraform.io/downloads.html) CLI client and run the following command in this
directory:

```bash
terraform init
```

Now *read the terraform documentation to learn how to declare new infrastructure and learn how it manages state*.
