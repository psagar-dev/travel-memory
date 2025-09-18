module "vpc" {
  source             = "./modules/vpc"
  project_name       = var.project_name
  vpc_cidr           = var.vpc_cidr
  public_subnet_cidr = var.public_subnet_cidr
  region             = var.region
}

module "security_group" {
  source       = "./modules/security_group"
  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
  vpc_cidr     = var.vpc_cidr
}

module "ec2" {
  source             = "./modules/ec2"
  project_name       = var.project_name
  ami_ec2            = var.ami_ec2
  instance_type      = var.instance_type
  subnet_id          = module.vpc.public_subnet_id
  security_group_id  = module.security_group.security_group_web_id
  security_group_db_id  = module.security_group.security_group_db_id
  key_name           = var.key_name
  instance_type_db   = var.instance_type_db
}