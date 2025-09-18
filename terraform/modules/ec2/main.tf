resource "aws_instance" "travel_memory_server" {
  ami                    = var.ami_ec2
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]
  key_name               = var.key_name

  tags = {
    Name = "${var.project_name}-server"
  }

  associate_public_ip_address = true
}

resource "aws_instance" "db" {
  ami                    = var.ami_ec2
  instance_type          = var.instance_type_db
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_db_id]
  key_name               = var.key_name

  tags = {
    Name = "${var.project_name}-db-server"
  }

  associate_public_ip_address = true
}