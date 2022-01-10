variable password {type = string}
variable vpc-security-group-ids {type = list(string)}
variable vpc-subnets {type = list(string)}
variable name {type = string}

data aws_region current {}

resource aws_db_subnet_group db {
  name = var.name
  subnet_ids = var.vpc-subnets
}

resource aws_db_instance db {
  identifier = var.name
  engine = "postgres"
  name = var.name
  username = "rP4tWt6uETggqC6z"
  password = var.password
  instance_class = "db.t3.micro"
  publicly_accessible = true
  availability_zone = "${data.aws_region.current.name}a"
  db_subnet_group_name = aws_db_subnet_group.db.name
  vpc_security_group_ids = var.vpc-security-group-ids
  apply_immediately = true
  allocated_storage = 20
  skip_final_snapshot = true
}

resource aws_ssm_parameter host {
  name = "/db/${var.name}/host"
  type = "SecureString"
  value = aws_db_instance.db.address
}

resource aws_ssm_parameter port {
  name = "/db/${var.name}/port"
  type = "SecureString"
  value = aws_db_instance.db.port
}

resource aws_ssm_parameter name {
  name = "/db/${var.name}/database"
  type = "SecureString"
  value = aws_db_instance.db.name
}

resource aws_ssm_parameter username {
  name = "/db/${var.name}/username"
  type = "SecureString"
  value = aws_db_instance.db.username
}

resource aws_ssm_parameter password {
  name = "/db/${var.name}/password"
  type = "SecureString"
  value = aws_db_instance.db.password
}