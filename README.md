#### End-to-End MERN Application Deployment and Monitoring with Terraform, Ansible, Prometheus, and Grafana

This project deploys a MERN stack Travel Memory application using AWS services such as EC2, Application Load Balancer (ALB), Auto Scaling Groups (ASG), Target Groups, and Cloudflare for enhanced security and DNS management.

---

#### 📁 Project Overview

TravelMemory is a full-stack application that consists of:
- **Backend**: Node.js/Express REST API connected to MongoDB Atlas
- **Frontend**: React application built

---

### ⚙️ Configure AWS CLI with Credentials

1. **Install AWS CLI** (if not already installed):
   ```bash
   sudo apt install awscli
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   ```
   You'll be prompted to enter:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., `ap-south-1`)
   - Output format (e.g., `json`)

   This creates a credentials file at `~/.aws/credentials`.

---

### 📦 Terraform install

1. **Install Terraform**:
    ```bash
    wget -O - https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(grep -oP '(?<=UBUNTU_CODENAME=).*' /etc/os-release || lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
    sudo apt update && sudo apt install terraform
    ```
---
Link Follow for [Installing Terafrom on Ubuntu](https://developer.hashicorp.com/terraform/install)

### 🛠️ Ansible Setup
```bash
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository --yes --update ppa:ansible/ansible
sudo apt install ansible
```
Link Follow for [Installing Ansible on Ubuntu](https://docs.ansible.com/ansible/latest/installation_guide/installation_distros.html#installing-ansible-on-ubuntu)


## 🛠 Terraform Infrastructure Provisioning

Terraform is used to provision AWS infrastructure for the application, including VPC, security groups, and EC2 instances.

### Project Directory Structure
```plaintext
E-CommerceStore/
├── terraform/
│   ├── modules/
│   │   ├── vpc/                   # VPC configuration
│   │   ├── security_group/        # Security group rules
│   │   ├── ec2/                   # EC2 instance setup
│   ├── main.tf                    # Main configuration
│   ├── variables.tf               # Global variables
│   ├── outputs.tf                 # Output values
│   ├── terraform.tfvars           # Variable values
│   ├── backend.tf                 # S3 backend for state
│   ├── provider.tf                # AWS provider
```

### Step 1: Configure Terraform Backend
File: `terraform/backend.tf`
```
terraform {
  backend "s3" {
    bucket         = "sagar-travel-memory-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "sagar-terraform-locks"
    encrypt        = true
  }
}
```
**Action**: Create S3 bucket and DynamoDB table:
```
# Create S3 bucket
aws s3api create-bucket \
  --bucket sagar-travel-memory-terraform-state \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket sagar-travel-memory-terraform-state \
  --versioning-configuration Status=Enabled \
  --region ap-south-1

aws dynamodb create-table \
  --table-name sagar-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region ap-south-1
```

- S3 & Dynamodb Create
![s3 & dynamodb](images/s3-dynamodb-create.png)

- S3 List
![s3 List](images/s3-list.png)

- Dynamodb List
![dynamodb List](images/dynamodb-list.png)

### Step 2: Define AWS Provider
File: `terraform/provider.tf`
```
terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "6.5.0"
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Environment = "production"
      Project     = var.project_name
      ManagedBy   = "Terraform"
    }
  }
}
```

### Step 3: Define Variables
File: `terraform/variables.tf`
```
variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "sagar-travel-memory"
}

variable "ami_ec2" {
  description = "Name of the ami"
  type        = string
  default     = "ami-0c55b159cbfafe1f0"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "instance_type_db" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
  default     = "sagar-b10"
}
```

### Step 4: VPC Module
File: `terraform/modules/vpc/main.tf`
```
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  map_public_ip_on_launch = true
  availability_zone       = "${var.region}a"
  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${var.project_name}-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
```
File: `terraform/modules/vpc/variables.tf`
```
variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}
```
File: `terraform/modules/vpc/outputs.tf`
```
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_id" {
  value = aws_subnet.public.id
}
```
### Step 5: Security Group Module
File: `terraform/modules/security_group/main.tf`
```
resource "aws_security_group" "travel_memory_web_sg" {
  vpc_id      = var.vpc_id
  name        = "${var.project_name}-sg"
  description = "Security group for travel-memory application"

  ingress {
    description = "HTTP for frontend"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Frontend port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Service ports for internal communication"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Service ports for prometheus"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH for debugging"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict to your IP in production
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

resource "aws_security_group" "travel_memory_db_sg" {
  vpc_id      = var.vpc_id
  name        = "${var.project_name}-db-sg"
  description = "Security group for travel-memory application"

  ingress {
    description = "Service ports for MongoDB"
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH for debugging"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict to your IP in production
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-db-sg"
  }
}
```
File: `terraform/modules/security_group/variables.tf`
```
variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block of the VPC"
  type        = string
}
```
File: `terraform/modules/security_group/outputs.tf`
```
output "security_group_web_id" {
  value = aws_security_group.travel_memory_web_sg.id
}

output "security_group_db_id" {
  value = aws_security_group.travel_memory_db_sg.id
}
```
### Step 6: EC2 Module
File: `terraform/modules/ec2/main.tf`
```
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
```
File: `terraform/modules/ec2/variables.tf`
```
variable "ami_ec2" {
  description = "Name of the ami"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "instance_type_db" {
  description = "EC2 instance type"
  type        = string
}

variable "subnet_id" {
  description = "ID of the subnet"
  type        = string
}

variable "security_group_id" {
  description = "ID of the security group"
  type        = string
}

variable "security_group_db_id" {
  description = "ID of the db security group"
  type        = string
}

variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
}
```
File: `terraform/modules/ec2/outputs.tf`
```
output "web_public_ip" {
  value = aws_instance.travel_memory_server.public_ip
}

output "db_public_ip" {
  value = aws_instance.db.public_ip
}
```
### Step 7: Main Terraform Configuration
File: `terraform/main.tf`
```
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
```
File: `terraform/outputs.tf`
```
output "web_url" {
  value       = "${module.ec2.web_public_ip}"
  description = "Public URL for the backend/frontend service"
}

output "db_url" {
  value       = "${module.ec2.db_public_ip}"
  description = "Public URL for the database service"
}
```
### Step 8: Terraform Variables
File: `terraform/terraform.tfvars`
```
region            = "ap-south-1"
project_name      = "sagar-travel-memory"
vpc_cidr          = "10.0.0.0/16"
public_subnet_cidr= "10.0.1.0/24"
ami_ec2           = "ami-02d26659fd82cf299"
instance_type     = "t3.medium"
instance_type_db  = "t2.micro"
key_name          = "sagar-b10"
```


## 🛠 Configuration Management with Ansible

### Step 1: Ansible Inventory
Create `ansible/inventory.ini` and populate it with the IPs from `terraform output`.
```
[web]
web ansible_host=65.0.96.55 ansible_user=ubuntu

[db]
db ansible_host=3.109.4.58 ansible_user=ubuntu

[all:vars]
ansible_ssh_private_key_file=/home/ubuntu/cred/sagar-b10.pem
```

### Step 2: Create Ansible Roles

Role: `common` (`roles/common/tasks/main.yml`): Base setup for all servers.
```yml
- name: Install essential packages
  apt:
    name: "{{ required_system_packages }}"
    state: present
    update_cache: yes
  tags: packages
```
File: `roles/common/vars/main.yml`
```yml
required_system_packages:
  - git
  - curl
  - vim
  - unzip
  - build-essential
  - libssl-dev
  - python3
  - rsync
```

Role: `nodejs`: Setup on server.
File: `roles/nodejs/defaults/main.yml`
```yml
nodejs_version: "22.x"

required_system_packages:
  - apt-transport-https
  - ca-certificates
  - gpg
```

File: `roles/nodejs/tasks/main.yml`
```yml
---
- name: Install Node.js {{ nodejs_version }} prerequisites
  apt:
    name: "{{ required_system_packages }}"
    state: present
    update_cache: yes
  become: yes

- name: Create keyrings directory for NodeSource GPG key
  file:
    path: "{{ nodejs_gpg_keyring_path }}"
    state: directory
    mode: '0755'
  become: yes
  
- name: Check if MongoDB GPG key already exists
  stat:
    path: "{{ nodejs_gpg_keyring }}"
  register: nodejs_gpg_keyring_stat

- name: Download NodeSource GPG key
  get_url:
    url: "{{ nodejs_gpg_download }}"
    dest: "{{ nodejs_gpg_key_dest }}"  # Temporary ASCII-armored file
    mode: '0644'
  become: yes
  when: not nodejs_gpg_keyring_stat.stat.exists
  tags: repository

- name: Dearmor NodeSource GPG key to binary format
  shell: gpg --dearmor -o {{ nodejs_gpg_keyring }} {{ nodejs_gpg_key_dest }}
  args:
    creates: "{{ nodejs_gpg_keyring }}"
  become: yes
  when: not nodejs_gpg_keyring_stat.stat.exists
  tags: repository

- name: Remove temporary GPG file
  file:
    path: "{{ nodejs_gpg_key_dest }}"
    state: absent
  become: yes
  when: not nodejs_gpg_keyring_stat.stat.exists
  tags: repository

- name: Set proper permissions on NodeSource GPG key
  file:
    path: "{{ nodejs_gpg_keyring }}"
    mode: '0644'
  become: yes
  tags: repository

- name: Add NodeSource APT repository (modern signed-by format)
  apt_repository:
    repo: "deb [signed-by={{ nodejs_gpg_keyring }}] {{ nodejs_repo_url }} nodistro main"
    state: present
    filename: nodesource
    update_cache: yes
  become: yes
  tags: repository

- name: Install Node.js {{ nodejs_version }}
  apt:
    name: nodejs
    state: present
  become: yes
  register: nodejs_install
  tags: install

- name: Verify Node.js version
  shell: node -v | grep -q "^v{{ nodejs_version.split('.')[0] }}"
  register: version_check
  failed_when: version_check.rc != 0
  changed_when: false
  tags: check_version
```

File: `roles/nodejs/vars/main.yml`
```yml
# Internal variables - not meant to be overridden
nodejs_gpg_key_dest: "/tmp/nodesource.gpg.asc"
nodejs_gpg_keyring_path: "/etc/apt/keyrings"
nodejs_gpg_keyring: "/etc/apt/keyrings/nodesource.gpg"
nodejs_gpg_download: "https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key"
nodejs_repo_url: "https://deb.nodesource.com/node_{{ nodejs_version }}"
```

Role: `mongodb`: Setup on DB server.
File: `roles/mongodb/defaults/main.yml`
```yml
---
# Default variables - can be overridden
mongodb_packages:
  - gnupg
  - curl
  - python3-pip

python_packages:
  - pymongo>=4.0

mongodb_gpg_key_url: "https://www.mongodb.org/static/pgp/server-{{ mongodb_version }}.asc"
mongodb_repo_url: "https://repo.mongodb.org/apt/ubuntu"
```
File: `roles/mongodb/tasks/main.yml`
```yml
---
- name: Ensure required packages are installed
  apt:
    name: "{{ mongodb_packages }}"
    state: present
    update_cache: yes
  tags: packages

- name: Install Python dependencies
  pip:
    name: "{{ python_packages }}"
    state: present
    executable: pip3
    extra_args: --break-system-packages # Uncomment if you face issues on newer Ubuntu versions
  tags: python

- name: Check if MongoDB GPG key already exists
  stat:
    path: "{{ mongodb_gpg_keyring }}"
  register: mongodb_gpg_keyring_stat

- name: Download MongoDB GPG key
  get_url:
    url: "{{ mongodb_gpg_key_url }}"
    dest: "{{ mongodb_gpg_key_dest }}"
    mode: '0644'
  when: not mongodb_gpg_keyring_stat.stat.exists
  tags: repository

- name: Import MongoDB GPG key
  command:
    cmd: gpg --dearmor -o "{{ mongodb_gpg_keyring }}" "{{ mongodb_gpg_key_dest }}"
    creates: "{{ mongodb_gpg_keyring }}"
  when: not mongodb_gpg_keyring_stat.stat.exists
  tags: repository

- name: Clean up temporary GPG key file
  file:
    path: "{{ mongodb_gpg_key_dest }}"
    state: absent
  when: not mongodb_gpg_keyring_stat.stat.exists
  tags: repository

- name: Add MongoDB repository
  apt_repository:
    repo: "deb [ arch=amd64,arm64 signed-by={{ mongodb_gpg_keyring }} ] {{ mongodb_repo_url }} {{ ansible_distribution_release }}/mongodb-org/{{ mongodb_version }} multiverse"
    state: present
    filename: "{{ mongodb_repo_file }}"
    update_cache: yes
  tags: repository

- name: Install MongoDB
  apt:
    name: mongodb-org
    state: present
    update_cache: yes
  notify: restart mongod
  tags: install

- name: Configure MongoDB
  template:
    src: mongod.conf.j2
    dest: /etc/mongod.conf
    owner: root
    group: root
    mode: '0644'
  notify: restart mongodb
  tags: config

- name: Ensure MongoDB service is enabled and started
  systemd:
    name: mongod
    state: started
    enabled: yes
  tags: service

- name: Wait for MongoDB to be available
  wait_for:
    port: "{{ mongodb_port }}"
    host: "{{ ansible_default_ipv4.address }}"
    delay: 10
    timeout: 60
    state: started
  tags: service

- name: Create MongoDB application user
  community.mongodb.mongodb_user:
    database: "{{ mongodb_database }}"
    name: "{{ mongodb_admin_user }}"
    password: "{{ mongodb_admin_password }}"
    roles: "{{ mongodb_user_roles }}"
    state: present
    login_host: "{{ ansible_default_ipv4.address }}"
    login_port: "{{ mongodb_port }}"
  tags: database
```
File: `roles/mongodb/handlers/main.yml`
```yml
- name: restart mongodb
  systemd:
    name: mongod
    state: restarted
    enabled: yes
```
File: `roles/mongodb/templates/mongod.conf.j2`
```yml
# MongoDB Configuration
# Managed by Ansible - DO NOT EDIT MANUALLY

storage:
  dbPath: /var/lib/mongodb

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: {{ mongodb_port }}
  bindIp: {{ mongodb_bind_ip }}

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
```
File: `roles/mongodb/vars/main.yml`

```yml
---
# Internal variables - not meant to be overridden
mongodb_gpg_key_dest: "/tmp/mongodb-server-{{ mongodb_version }}.asc"
mongodb_gpg_keyring: "/usr/share/keyrings/mongodb-server-{{ mongodb_version }}.gpg"
mongodb_repo_file: "mongodb-org-{{ mongodb_version }}"
```

Role: `nginx`: Setup on server.
File: `roles/nginx/tasks/main.yml`
```yml
- name: Install Nginx
  apt:
    name: nginx
    state: present
    update_cache: yes

- name: Create web root directory
  file:
    path: "{{ web_root }}"
    state: directory
    owner: "{{ app_user }}"
    group: "{{ app_group }}"
    mode: '0755'

- name: Remove default Nginx site
  file:
    path: "{{ nginx_default_site_enabled }}"
    state: absent
  notify: "nginx config changed"

- name: Validate Nginx configuration syntax
  command: nginx -t
  register: nginx_test
  changed_when: false
  check_mode: no

- name: Create Nginx configuration
  template:
    src: "{{ template_nginx_configuration_src }}"
    dest: "{{ template_nginx_sites_available_dest }}"
    owner: root
    group: root
    mode: '0644'
  notify: "nginx config changed"
  tags: nginx-configuration

- name: Enable site
  file:
    src: "{{ template_nginx_sites_available_dest }}"
    dest: "{{ template_nginx_site_enabled_dest }}"
    state: link
  notify: "nginx config changed"

- name: Verify Nginx is serving content
  uri:
    url: "http://localhost/"
    status_code: 200
  register: nginx_status
  until: nginx_status.status == 200
  retries: 5
  delay: 2
  ignore_errors: yes
  tags: nginx-verification
```

File: `roles/nginx/handlers/main.yml`

```yml
- name: restart nginx
  systemd:
    name: nginx
    state: restarted
    enabled: yes
  listen: "nginx config changed"
```

File: `roles/nginx/var/main.yml`

```yml
nginx_site_enabled_path: "/etc/nginx/sites-enabled"
nginx_default_site_enabled: "{{ nginx_site_enabled_path }}/default"
template_nginx_configuration_src: "nginx.conf.j2"
template_nginx_sites_available_dest: "/etc/nginx/sites-available/{{ app_name }}"
template_nginx_site_enabled_dest: "{{ nginx_site_enabled_path }}/{{ app_name }}"
```

File: `roles/nginx/templates/nginx.conf.j2`
```
server {
    listen 80;
    server_name _;

    root /var/www/html;
    index index.html;

    location ~ /\.(?!well-known).* {
        deny all;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```


Role: `app`: Setup on server.
File: `roles/app/tasks/main.yml`
```yml
---
#backend deployment
- name: Clone TravelMemory repository
  git:
    repo: "https://github.com/psagar-dev/travel-memory-hv.git"
    dest: "{{ app_directory }}"
    version: "{{ deployment_branch | default('main') }}" # or a specific stable branch/tag
    force: yes
    update: yes
  tags: clone

- name: Create backend .env configuration
  template:
    src: "backend.env.j2"
    dest: "{{ app_directory }}/backend/.env"
    mode: '0640'
    owner: "{{ app_user }}"
    group: "{{ app_group }}"
  tags: configuration

- name: Install backend dependencies
  npm:
    path: "{{ app_directory }}/backend"
    state: present
    production: yes
  notify: restart pm2
  tags: backend-deps

- name: Install PM2 globally
  ansible.builtin.npm:
    name: pm2
    global: yes
    state: present
  tags: pm2-setup

- name: Check PM2 processes
  command: pm2 jlist
  register: pm2_list
  changed_when: false
  failed_when: false
  tags: pm2_deployment

- name: Parse PM2 list and get app
  set_fact:
    pm2_app: >-
      {{
        (pm2_list.stdout | default('[]') | from_json)
        | selectattr('name', 'equalto', 'travel-memory-backend')
        | list | first | default(None)
      }}
  tags: pm2_deployment

- name: Debug PM2 state
  debug:
    msg: "PM2 app state: {{ pm2_app.pm2_env.status if pm2_app is not none else 'not found' }}"
  tags: pm2_deployment

- name: Start PM2 app if not found
  command:
    cmd: pm2 start index.js --name "travel-memory-backend" --update-env
    chdir: "{{ app_directory }}/backend"
  when: pm2_app is none
  tags: pm2_deployment
  notify: restart pm2

- name: Restart PM2 app if stopped/errored
  command:
    cmd: pm2 restart travel-memory-backend --update-env
    chdir: "{{ app_directory }}/backend"
  when: pm2_app is not none and pm2_app.pm2_env.status in ['stopped', 'errored']
  tags: pm2_deployment
  notify: restart pm2

- name: Reload PM2 app if online
  command:
    cmd: pm2 reload travel-memory-backend --update-env
    chdir: "{{ app_directory }}/backend"
  when: pm2_app is not none and pm2_app.pm2_env.status == 'online'
  tags: pm2_deployment

# Frontend Deployment
- name: Create frontend .env configuration
  template:
    src: "frontend.env.j2"
    dest: "{{ app_directory }}/frontend/.env"
    mode: '0640'
    owner: "{{ app_user }}"
    group: "{{ app_group }}"
  tags: configuration

- name: Install frontend dependencies
  npm:
    path: "{{ app_directory }}/frontend"
    state: present
    production: yes
  tags: frontend-deps

- name: Update Browserslist DB
  command: npx update-browserslist-db@latest --update-db
  args:
    chdir: "{{ app_directory }}/frontend"
  environment:
    BROWSERSLIST_IGNORE_OLD_DATA: "1"
  tags: frontend-deps

- name: Build frontend application
  command: npm run build
  args:
    chdir: "{{ app_directory }}/frontend"
  environment:
    GENERATE_SOURCEMAP: "false"
    NODE_ENV: "production"
  tags: build-frontend

- name: Copy built frontend to web root
  command: rsync -a --delete {{ app_directory }}/frontend/build/ {{ web_root }}/
  become: true
  tags: deploy-frontend

- name: Set correct permissions on web root
  file:
    path: "{{ web_root }}"
    owner: "{{ app_user }}"
    group: "{{ app_group }}"
    mode: '0755'
    recurse: yes
```

File: `roles/app/handlers/main.yml`
```yml
---
- name: restart pm2
  command:
    cmd: pm2 restart travel-memory-backend --update-env
  register: pm2_restart
  changed_when: >
    "'restarted' in pm2_restart.stdout or 
     'online' in pm2_restart.stdout or
     'success' in pm2_restart.stdout"
```

File: `roles/app/vars/main.yml`
```yml
app_user: www-data
app_group: www-data
app_directory: /home/ubuntu/{{ app_name }}
web_root: /var/www/html

deployment_branch: main

required_system_packages:
  - git
  - curl
  - build-essential
  - libssl-dev
  - python3
  - rsync
```

File: `roles/app/templates/backend.env.j2`
```yml
MONGO_URI='mongodb://traveluser:traveluserPassword@3.109.4.58:27017/travel?authSource=travel'
PORT=3001
```

File: `roles/app/templates/frontend.env.j2`
```yml
REACT_APP_BACKEND_URL=http://65.0.96.55:3001
```

### Step 3: Create `Group_vars`
File: `group_vars/all/vars.yml`
```yml
---
# MongoDB specific variables
mongodb_version: "8.0"
mongodb_bind_ip: "0.0.0.0"
mongodb_port: 27017
mongodb_admin_user: "traveluser"
mongodb_admin_password: "traveluserPassword"
mongodb_database: "travel"
mongodb_user_roles: ["readWrite", "dbAdmin"]

app_name: travel-memory-hv
```

### Step 4: Master Playbook `playbook.yaml`
Create `ansible/playbook.yaml`
```yml
---
- name: Configure MongoDb Server
  hosts: db
  become: yes
  roles:
    - common
    - mongodb

- name: Configure Web Server
  hosts: web
  become: yes
  roles:
    - common
    - nodejs
    - nginx
    - app
    - prometheus
    - grafana
```

## 🛠 Observability and Monitoring
##### Step 1: Instrument the Application
1. In the travel-memory/backend, install `prom-client`: `npm install prom-client`.
Create new file called: `backend/metrics.js`
```js
// monitoring.js
const promClient = require('prom-client');

const register = new promClient.Registry();

// Enable default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [10, 50, 100, 300, 500, 1000, 2000, 5000]
});

const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const httpErrorsTotal = new promClient.Counter({
    name: 'http_errors_total',
    help: 'Total number of HTTP errors',
    labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpErrorsTotal);

module.exports = {
    register,
    httpRequestDurationMicroseconds,
    httpRequestsTotal,
    httpErrorsTotal
};
```
In your index.js code and expose metrics:
```js
const { httpRequestDurationMicroseconds, httpRequestsTotal, httpErrorsTotal, register } = require('./metrics');

app.use((req, res, next) => {
    if (req.path === '/metrics') return next(); // Skip tracking for metrics
    
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        let route = req.route?.path || req.path;
        
        // Normalize dynamic routes: e.g., "/user/123" -> "/user/:id"
        if (req.params && Object.keys(req.params).length > 0) {
            Object.keys(req.params).forEach(param => {
                route = route.replace(req.params[param], `:${param}`);
            });
        }
        
        // Record metrics
        httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
        httpRequestDurationMicroseconds
            .labels(req.method, route, res.statusCode)
            .observe(duration);
        
        // Track errors (4xx and 5xx status codes)
        if (res.statusCode >= 400) {
            httpErrorsTotal.labels(req.method, route, res.statusCode).inc();
        }
    });
    
    next();
});
```
Create new routes

```js
app.get('/api/500', (req, res) => {
    res.status(500).send('Internal Server Error');
});

app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        console.error('Error generating metrics:', error);
        res.status(500).send('Error generating metrics');
    }
});
```
##### Step 2: Create Ansible Roles for Monitoring

Role: `prometheus`: Setup on server.
File: `roles/prometheus/defaults/main.yml`
```yml
---
prometheus_version: "3.5.0"
prometheus_install_dir: "/opt/prometheus"
prometheus_config_dir: "/etc/prometheus"
prometheus_data_dir: "/var/lib/prometheus"
prometheus_retention_time: "30d"
prometheus_user: "prometheus"
prometheus_group: "prometheus"
```

File: `roles/prometheus/tasks/main.yml`
```yml
- name: Create Prometheus user and group
  user:
    name: "{{ prometheus_user }}"
    system: yes
    shell: /bin/false
    home: "{{ prometheus_install_dir }}"
    create_home: no
  tags: create_prometheus_user

- name: Create installation and configuration directories
  file:
    path: "{{ item }}"
    state: directory
    owner: "{{ prometheus_user }}"
    group: "{{ prometheus_user }}"
  loop:
    - "{{ prometheus_install_dir }}"
    - "{{ prometheus_config_dir }}"
    - "{{ prometheus_data_dir }}"
  tags: install

- name: Download and extract Prometheus directly to install directory
  unarchive:
    src: "{{ prometheus_download_url }}"
    dest: "{{ prometheus_install_dir }}"
    remote_src: yes
    owner: "{{ prometheus_user }}"
    group: "{{ prometheus_user }}"
  tags: download

- name: List files in installation directory
  command: ls -la "{{ prometheus_install_dir }}"
  tags: list

- name: Find the actual prometheus binary directory
  find:
    paths: "{{ prometheus_install_dir }}"
    patterns: "prometheus*"
    file_type: directory
  register: prometheus_dirs
  tags: find

- name: Move contents to root of installation directory if nested
  shell: |
    if [ -d "{{ prometheus_install_dir }}/prometheus-{{ prometheus_version }}.linux-amd64" ]; then
      mv "{{ prometheus_install_dir }}/prometheus-{{ prometheus_version }}.linux-amd64"/* "{{ prometheus_install_dir }}/"
      rm -rf "{{ prometheus_install_dir }}/prometheus-{{ prometheus_version }}.linux-amd64"
    fi
  args:
    executable: /bin/bash
  when: prometheus_dirs.files | length > 0
  tags: move

- name: Create symbolic links for binaries
  file:
    src: "{{ prometheus_install_dir }}/{{ item }}"
    dest: "/usr/local/bin/{{ item }}"
    state: link
    owner: "{{ prometheus_user }}"
    group: "{{ prometheus_user }}"
    force: yes
  loop:
    - prometheus
    - promtool
  tags: symlink

- name: Check if configuration files exist
  stat:
    path: "{{ prometheus_install_dir }}/{{ item }}"
  register: config_files
  loop:
    - prometheus.yml
    - consoles
    - console_libraries
  tags: config_check

- name: Copy existing configuration files
  copy:
    src: "{{ prometheus_install_dir }}/{{ item.item }}"
    dest: "{{ prometheus_config_dir }}/"
    remote_src: yes
    owner: "{{ prometheus_user }}"
    group: "{{ prometheus_user }}"
  loop: "{{ config_files.results }}"
  when: item.stat.exists
  notify: restart prometheus
  tags: copy_config

- name: Create default prometheus.yml if it doesn't exist
  template: 
    src: prometheus.yml.j2
    dest: "{{ prometheus_config_dir }}/prometheus.yml"
    owner: "{{ prometheus_user }}"
    group: "{{ prometheus_user }}"
    mode: '0644'
  when: not config_files.results[0].stat.exists
  notify: restart prometheus
  tags: default_config

- name: Create empty directories if they don't exist
  file:
    path: "{{ prometheus_config_dir }}/{{ item }}"
    state: directory
    owner: "{{ prometheus_user }}"
    group: "{{ prometheus_user }}"
  loop:
    - consoles
    - console_libraries
  when: not config_files.results[1].stat.exists or not config_files.results[2].stat.exists
  tags: create_dirs

- name: Configure systemd service
  template:
    src: prometheus.service.j2
    dest: /etc/systemd/system/prometheus.service
    owner: root
    group: root
    mode: '0644'
  notify:
    - daemon-reload
    - restart prometheus
  tags: systemd

- name: Ensure proper permissions on installation directory
  file:
    path: "{{ prometheus_install_dir }}"
    owner: "{{ prometheus_user }}"
    group: "{{ prometheus_user }}"
    recurse: yes
  tags: permissions
```

File: `roles/prometheus/handlers/main.yml`
```yml
- name: daemon-reload
  systemd:
    daemon_reload: yes 

- name: restart prometheus
  systemd:
    name: prometheus
    state: restarted
    enabled: yes
```

File: `roles/prometheus/vars/main.yml`
```yml
---
prometheus_download_url: "https://github.com/prometheus/prometheus/releases/download/v{{ prometheus_version }}/prometheus-{{ prometheus_version }}.linux-amd64.tar.gz"
prometheus_binary_name: "prometheus-{{ prometheus_version }}.linux-amd64"
```

File: `roles/prometheus/templates/prometheus.service.j2`
```yml
[Unit]
Description=Prometheus
Documentation=https://prometheus.io/docs/introduction/overview/
After=network.target

[Service]
User={{ prometheus_user }}
Group={{ prometheus_user }}
Type=simple
ExecStart=/usr/local/bin/prometheus \
    --config.file={{ prometheus_config_dir }}/prometheus.yml \
    --storage.tsdb.path={{ prometheus_data_dir }} \
    --web.console.templates={{ prometheus_config_dir }}/consoles \
    --web.console.libraries={{ prometheus_config_dir }}/console_libraries \
    --web.listen-address=:9090
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

File: `roles/prometheus/templates/prometheus.yml.j2`
```yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  - job_name: 'node_app'
    static_configs:
      - targets: ['localhost:3000/metrics']  # Adjust to your Node.js metrics endpoint
```

Role: `grafana`: Setup on server.
File: `roles/grafana/defaults/main.yml`
```yml
grafana_version: "12.1.1"
grafana_plugins:
  - "grafana-piechart-panel"
grafana_datasources_dir: "/etc/grafana/provisioning/datasources"
grafana_dashboards_dir: "/etc/grafana/provisioning/dashboards"
grafana_dashboards_json_dir: "/var/lib/grafana/dashboards"
```

File: `roles/grafana/tasks/main.yml`
```yml
- name: Add Grafana GPG key
  apt_key:
    url: https://packages.grafana.com/gpg.key
    state: present
  tags: grafana-gpg

- name: Add Grafana APT repository
  apt_repository:
    repo: "deb {{ apt_repo }} stable main"
    state: present
    filename: "grafana"
  tags: grafana-repository

- name: Update apt cache
  apt:
    update_cache: yes
    cache_valid_time: 3600

- name: Install Grafana (pinned version)
  apt:
    name: "grafana={{ grafana_version }}"
    state: present
    force_apt_get: yes
  environment:
    GF_INSTALL_PLUGINS: "{{ grafana_plugins | join(',') }}"

- name: Create Grafana directories
  file:
    path: "{{ item }}"
    state: directory
    owner: grafana
    group: grafana
    mode: '0755'
  loop:
    - "{{ grafana_datasources_dir }}"
    - "{{ grafana_dashboards_dir }}"
    - "{{ grafana_dashboards_json_dir }}"
  notify: restart grafana

- name: Ensure Grafana service is enabled and started
  systemd:
    name: grafana-server
    state: started
    enabled: yes
    daemon_reload: yes
```

File: `roles/grafana/handlers/main.yml`
```yml
- name: restart grafana
  systemd:
    name: grafana-server
    state: restarted
    daemon_reload: yes
```

File: `roles/grafana/vars/main.yml`
```yml
apt_repo: https://packages.grafana.com/oss/deb
```

## 📜 Project Information

### 📄 License Details
This project is released under the MIT License, granting you the freedom to:
- 🔓 Use in commercial projects
- 🔄 Modify and redistribute
- 📚 Use as educational material

## 📞 Contact

📧 Email: [Email Me](securelooper@gmail.com
)
🔗 LinkedIn: [LinkedIn Profile](https://www.linkedin.com/in/sagar-93-patel)  
🐙 GitHub: [GitHub Profile](https://github.com/psagar-dev)  

---

<div align="center">
  <p>Built with ❤️ by Sagar Patel</p>
</div>