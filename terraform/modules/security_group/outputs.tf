output "security_group_web_id" {
  value = aws_security_group.travel_memory_web_sg.id
}

output "security_group_db_id" {
  value = aws_security_group.travel_memory_db_sg.id
}