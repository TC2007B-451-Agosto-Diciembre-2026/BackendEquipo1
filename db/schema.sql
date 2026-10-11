CREATE DATABASE sentinel;
USE sentinel;
CREATE TABLE roles (
role_id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(50) NOT NULL,
CONSTRAINT uq_roles_name UNIQUE (name)
);
CREATE TABLE categories (
category_id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(50) NOT NULL,
CONSTRAINT uq_fraud_types_name UNIQUE (name)
);
CREATE TABLE validation_statuses (
status_id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(20) NOT NULL,
CONSTRAINT uq_validation_statuses_name UNIQUE (name)
);
CREATE TABLE users (
user_id INT AUTO_INCREMENT PRIMARY KEY,
role_id INT NOT NULL,
name VARCHAR(100) NOT NULL,
email VARCHAR(150) NOT NULL,
password_hash VARCHAR(64) NOT NULL,
phone VARCHAR(20) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP,
deleted_at TIMESTAMP NULL DEFAULT NULL,
CONSTRAINT uq_users_email UNIQUE (email),
CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (role_id),
CONSTRAINT chk_users_email CHECK (email LIKE '%@%')
);
CREATE TABLE reports (
report_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
admin_id INT NULL DEFAULT NULL,
fraud_type_id INT NOT NULL,
status_id INT NOT NULL DEFAULT 1, 
case_type VARCHAR(15) NOT NULL,
title VARCHAR(150) NOT NULL,
description TEXT NOT NULL,
fraud_probability DECIMAL(5,2) NULL DEFAULT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE
CURRENT_TIMESTAMP,
approved_at TIMESTAMP NULL DEFAULT NULL,
deleted_at TIMESTAMP NULL DEFAULT NULL,
CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users (user_id),
CONSTRAINT fk_reports_admin FOREIGN KEY (admin_id) REFERENCES users (user_id),
CONSTRAINT fk_reports_fraud_type FOREIGN KEY (fraud_type_id) REFERENCES
fraud_types (fraud_type_id),
CONSTRAINT fk_reports_status FOREIGN KEY (status_id) REFERENCES
validation_statuses (status_id),
CONSTRAINT chk_reports_case_type CHECK (case_type IN ('señalamiento', 'report')),
CONSTRAINT chk_reports_probability CHECK (fraud_probability BETWEEN 0 AND 100)
);
CREATE TABLE evidence (
evidence_id INT AUTO_INCREMENT PRIMARY KEY,
report_id INT NOT NULL,
evidence_type VARCHAR(15) NOT NULL,
content TEXT NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_evidence_report FOREIGN KEY (report_id) REFERENCES reports
(report_id)
ON DELETE CASCADE,
CONSTRAINT chk_evidence_type CHECK (evidence_type IN ('url', 'text', 'phone',
'image'))
);
