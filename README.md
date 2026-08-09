# 📝 Week 2: Blog Platform API with JWT Authentication (SQL Version)

**Track:** Backend Web Development  
**Week:** 2 of 4  
**Stack:** Node.js, Express, SQLite (Sequelize ORM), JWT, BcryptJS

---

## 📌 Project Overview
A secure RESTful API backend for a blogging platform built using **Express** and an embedded **SQLite (SQL)** database. SQLite requires **zero installation** and works directly inside a local file (`blog_platform.sqlite`).

### Key Capabilities
- **Authentication**: User registration (`POST /register`) and login (`POST /login`) with encrypted passwords using `bcryptjs` and session tokens issued using `jsonwebtoken` (JWT).
- **Public Access**: Anyone can view all blog posts (`GET /posts`) or view a single post by ID (`GET /posts/:id`).
- **Protected Access**: Creating posts (`POST /posts`) requires a valid Bearer JWT token in the Authorization header.
- **Resource Ownership (RBAC)**: Updating (`PUT /posts/:id`) or deleting (`DELETE /posts/:id`) a blog post is strictly restricted to the user who created it (`403 Forbidden` for unauthorized attempts).
- **Interactive UI Dashboard**: Includes an integrated web frontend (`public/index.html`) for visually testing API endpoints, authentication flows, and live HTTP requests.

---

## 🚀 Quick Setup Guide

### 1. Installation
Navigate into the project directory and install the dependencies:
```bash
cd Week-2-Blog-Platform-API
npm install
```

### 2. Running the Server
Start the development server:
```bash
npm run dev
# or
node server.js
```
The database file `blog_platform.sqlite` will be automatically created upon server launch.

Once running, access the server at:
- **API Base URL**: `http://localhost:5000`
- **Interactive Web Dashboard**: `http://localhost:5000`

---

## 📡 API Reference & Endpoints

### 1. Authentication Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register a new user (`username`, `email`, `password`) |
| `POST` | `/login` | Public | Log in user & receive a Bearer JWT token |

### 2. Blog Post Endpoints
| Method | Endpoint | Access | Header Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/posts` | Public | None | Retrieve all blog posts |
| `GET` | `/posts/:id` | Public | None | Retrieve a single post by ID |
| `POST` | `/posts` | Protected | `Authorization: Bearer <token>` | Create a new blog post |
| `PUT` | `/posts/:id` | Owner Only | `Authorization: Bearer <token>` | Update a post (Must be post author) |
| `DELETE` | `/posts/:id` | Owner Only | `Authorization: Bearer <token>` | Delete a post (Must be post author) |

---

## 🧪 Error Handling & Status Codes
- **`200 OK`**: Request succeeded.
- **`201 Created`**: Resource created successfully.
- **`400 Bad Request`**: Missing required fields or duplicate username/email.
- **`401 Unauthorized`**: Missing, invalid, or expired JWT token.
- **`403 Forbidden`**: Authenticated user trying to edit/delete a post owned by someone else.
- **`404 Not Found`**: Post or route not found.
- **`500 Internal Server Error`**: Unexpected server error.
