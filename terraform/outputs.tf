output "web_url" {
  value       = "${module.ec2.web_public_ip}"
  description = "Public URL for the backend/frontend service"
}

output "db_url" {
  value       = "${module.ec2.db_public_ip}"
  description = "Public URL for the database service"
}