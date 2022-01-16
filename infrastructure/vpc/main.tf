variable name {type = string}

data aws_region current {}

resource aws_vpc vpc {
  tags = {
    Name = var.name
  }
  cidr_block = "172.31.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
}

resource aws_internet_gateway vpc {
  vpc_id = aws_vpc.vpc.id
}

resource aws_network_interface vpc {
  subnet_id = aws_subnet.lambda-igw-a.id
  source_dest_check = false
}

resource aws_eip vpc {
  vpc = true
}

resource aws_nat_gateway vpc {
  allocation_id = aws_eip.vpc.id
  subnet_id = aws_subnet.lambda-igw-a.id
}

# Subnets

resource aws_subnet general-a {
  vpc_id = aws_vpc.vpc.id
  cidr_block = "172.31.0.0/20"
  availability_zone = "${data.aws_region.current.name}a"
  map_public_ip_on_launch = true
}

resource aws_subnet general-b {
  vpc_id = aws_vpc.vpc.id
  cidr_block = "172.31.16.0/20"
  availability_zone = "${data.aws_region.current.name}b"
  map_public_ip_on_launch = true
}

resource aws_subnet general-c {
  vpc_id = aws_vpc.vpc.id
  cidr_block = "172.31.32.0/20"
  availability_zone = "${data.aws_region.current.name}c"
  map_public_ip_on_launch = true
}

resource aws_subnet lambda-nat-a {
  vpc_id = aws_vpc.vpc.id
  cidr_block = "172.31.48.0/20"
  availability_zone = "${data.aws_region.current.name}a"
  map_public_ip_on_launch = false
}

resource aws_subnet lambda-nat-b {
  vpc_id = aws_vpc.vpc.id
  cidr_block = "172.31.64.0/20"
  availability_zone = "${data.aws_region.current.name}b"
  map_public_ip_on_launch = false
}

resource aws_subnet lambda-nat-c {
  vpc_id = aws_vpc.vpc.id
  cidr_block = "172.31.80.0/20"
  availability_zone = "${data.aws_region.current.name}c"
  map_public_ip_on_launch = false
}

resource aws_subnet lambda-igw-a {
  vpc_id = aws_vpc.vpc.id
  cidr_block = "172.31.96.0/20"
  availability_zone = "${data.aws_region.current.name}a"
  map_public_ip_on_launch = false
}

# Internet gateway

resource aws_route_table igw {
  vpc_id = aws_vpc.vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.vpc.id
  }
}

resource aws_route_table_association general-a {
  route_table_id = aws_route_table.igw.id
  subnet_id = aws_subnet.general-a.id
}

resource aws_route_table_association general-b {
  route_table_id = aws_route_table.igw.id
  subnet_id = aws_subnet.general-b.id
}

resource aws_route_table_association general-c {
  route_table_id = aws_route_table.igw.id
  subnet_id = aws_subnet.general-c.id
}

resource aws_route_table_association lambda-igw-a {
  route_table_id = aws_route_table.igw.id
  subnet_id = aws_subnet.lambda-igw-a.id
}

# NAT

resource aws_route_table lambda-nat {
  vpc_id = aws_vpc.vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.vpc.id
  }
}

resource aws_route_table_association lambda-nat-a {
  route_table_id = aws_route_table.lambda-nat.id
  subnet_id = aws_subnet.lambda-nat-a.id
}

resource aws_route_table_association lambda-nat-b {
  route_table_id = aws_route_table.lambda-nat.id
  subnet_id = aws_subnet.lambda-nat-b.id
}

resource aws_route_table_association lambda-nat-c {
  route_table_id = aws_route_table.lambda-nat.id
  subnet_id = aws_subnet.lambda-nat-c.id
}

# Security groups

resource aws_security_group main {
  name = var.name
  vpc_id = aws_vpc.vpc.id
}

resource aws_security_group_rule internal {
  security_group_id = aws_security_group.main.id
  type = "ingress"
  from_port = 0
  to_port = 0
  protocol = "-1"
  self = true
}

resource aws_security_group_rule internal-egress {
  security_group_id = aws_security_group.main.id
  type = "egress"
  from_port = 0
  to_port = 0
  protocol = "-1"
  self = true
}

resource aws_security_group_rule outbound {
  security_group_id = aws_security_group.main.id
  type = "egress"
  from_port = 0
  to_port = 65535
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}

resource aws_security_group_rule postgres-inbound {
  security_group_id = aws_security_group.main.id
  type = "ingress"
  from_port = 5432
  to_port = 5432
  protocol = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}

# SSM

resource aws_ssm_parameter security-group {
  name = "/vpc/${var.name}/security-group-id"
  type = "SecureString"
  value = aws_security_group.main.id
}

resource aws_ssm_parameter lambda-subnet-a {
  name = "/vpc/${var.name}/lambda-subnet-a"
  type = "SecureString"
  value = aws_subnet.lambda-nat-a.id
}

resource aws_ssm_parameter lambda-subnet-b {
  name = "/vpc/${var.name}/lambda-subnet-b"
  type = "SecureString"
  value = aws_subnet.lambda-nat-b.id
}

resource aws_ssm_parameter lambda-subnet-c {
  name = "/vpc/${var.name}/lambda-subnet-c"
  type = "SecureString"
  value = aws_subnet.lambda-nat-b.id
}

# Output

output security-group-id {
  value = aws_security_group.main.id
}

output general-subnets {
  value = [
    aws_subnet.general-a.id,
    aws_subnet.general-b.id,
    aws_subnet.general-c.id
  ]
}