# 📊 Project Submission Report: Week 2 Blog Platform API (SQL Version)

**Student / Developer Track**: Backend Web Development  
**Assignment**: Week 2 - Blog Platform API with JWT Authentication  
**Database**: SQLite (SQL) via Sequelize ORM  
**Completion Date**: August 2026  

---

## 🎯 Executive Summary
This project delivers a complete backend RESTful API for a Blogging Platform built using Node.js, Express, and an embedded SQLite (SQL) database. The system enforces secure user authentication via **JSON Web Tokens (JWT)** and **bcryptjs password hashing**, alongside strict **resource ownership authorization** ensuring users can only modify or delete their own posts.

---

## 📋 Requirement Verification Matrix

| Requirement | Implementation Status | Technical Detail |
| :--- | :---: | :--- |
| **User Registration (`POST /register`)** | ✅ Complete | Passwords hashed via Sequelize `beforeCreate` hook using `bcryptjs`. Returns JWT token. |
| **User Login (`POST /login`)** | ✅ Complete | Verifies credentials with `user.matchPassword()`. Returns JWT token. |
| **Public Endpoints (`GET /posts`, `GET /posts/:id`)** | ✅ Complete | Publicly accessible without authentication. Returns post object with author details populated. |
| **Protected Endpoints (`POST /posts`)** | ✅ Complete | Requires `Authorization: Bearer <token>` header verified by `authMiddleware.js`. |
| **Authorization Check (`PUT /posts/:id`, `DELETE /posts/:id`)** | ✅ Complete | Ownership check verifies `post.userId === req.user.id`. Returns `403 Forbidden` if unauthorized. |
| **Error Handling (401, 403, 404, 400, 500)** | ✅ Complete | Centralized error handler formats clean JSON messages for invalid tokens, unauthorized access, and validation errors. |
| **Interactive Dashboard & Documentation** | ✅ Complete | Built-in dark-mode dashboard at `http://localhost:5000`, Postman Collection, and comprehensive README. |

---

## 🛠️ System Architecture & Code Design

### 1. Security Architecture
- **Password Security**: Passwords are never stored in plain text. Sequelize hooks compute a salted bcrypt hash prior to database storage.
- **Stateless Authentication**: JWT tokens are signed using a secret key (`JWT_SECRET`) and carry the user ID in the payload.
- **Middleware Guard**: `authMiddleware.js` extracts the `Bearer` token, verifies signature and expiration, and attaches the user model to `req.user`.

### 2. Authorization Flow
For any write/modify operation on a post:
```
Client Request -> Express Router -> authMiddleware (JWT Check: 401 if invalid) -> postController -> Ownership Verification (post.userId == req.user.id: 403 if mismatch) -> Database Update/Delete -> Response
```

---

## 🏁 Conclusion
The Week 2 Blog Platform API successfully satisfies all functional, security, and architectural criteria outlined in the assessment brief.
