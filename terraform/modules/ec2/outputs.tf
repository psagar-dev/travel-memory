output "web_public_ip" {
  value = aws_instance.travel_memory_server.public_ip
}

output "db_public_ip" {
  value = aws_instance.db.public_ip
}