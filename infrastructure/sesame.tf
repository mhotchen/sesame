variable sesame-db-password {}

module sesame-vpc {
  source = "./vpc"
  name = "sesame"
}

module sesame-db {
  source = "./db"
  name = "sesame"
  password = var.sesame-db-password
  vpc-security-group-ids = [module.sesame-vpc.security-group-id]
  vpc-subnets = module.sesame-vpc.general-subnets
}

module sesame-user-pool {
  source = "./user-pool"
  name = "sesame"
}