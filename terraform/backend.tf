terraform {
  backend "s3" {
    bucket         = "sagar-travel-memory-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "sagar-terraform-locks"
    encrypt        = true
  }
}