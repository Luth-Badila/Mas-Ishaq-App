CREATE DATABASE ecommerce_node;

USE ecommerce_node;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL(10,2),
  description TEXT,
  image VARCHAR(255)
);
