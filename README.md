# E-Commerce Platform

A full-stack multi-vendor e-commerce platform built with React and Django REST Framework.

## 🚀 Overview

This project is a complete e-commerce application that supports both customers and vendors.

Customers can browse products, manage their cart and wishlist, place orders, make payments, manage their profile and addresses, and interact with products through reviews.

Vendors can manage their store, products, orders, and vendor profile through a dedicated vendor dashboard.

## ✨ Features

### 👤 Customer Features

- User registration and login
- JWT authentication
- Product browsing
- Product details
- Product search
- Product filtering
- Product ordering
- Shopping cart
- Wishlist
- Checkout
- Order management
- Order details
- Address management
- Product reviews
- Notifications
- User profile

### 🏪 Vendor Features

- Vendor authentication
- Vendor dashboard
- Vendor store management
- Vendor profile management
- Product creation
- Product editing
- Product management
- Product image management
- Vendor order management
- Vendor-specific product and order access

### 🛒 E-Commerce Features

- Categories
- Brands
- Products
- Product images
- Cart
- Wishlist
- Orders
- Payments
- Coupons
- Reviews
- Addresses
- Notifications
- Vendor stores

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- JavaScript
- CSS

### Backend

- Python
- Django
- Django REST Framework
- JWT Authentication

### Database

- SQLite for development

## 📁 Project Structure

```text
ecommerce/
│
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── addresses/
│   │   ├── brands/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── core/
│   │   ├── coupons/
│   │   ├── notifications/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── products/
│   │   ├── reviews/
│   │   ├── stores/
│   │   ├── vendors/
│   │   └── wishlist/
│   │
│   ├── config/
│   ├── manage.py
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── .gitignore
│
└── README.md