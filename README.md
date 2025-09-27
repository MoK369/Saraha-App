# 🌐 Saraha App - Node.js Backend

Saraha App is a secure and scalable backend API built with Node.js and Express, designed for anonymous messaging. It supports traditional email/password authentication and Google login, with robust validation, encryption, and email verification mechanisms.

---

## 📦 Tech Stack

- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **JWT** for authentication
- **Nodemailer** for email verification
- **Google OAuth2** login
- **Joi** for input validation
- **bcryptjs** + **crypto-js** for hashing and encryption
- **Cloudinary** for media storage
- **Helmet**, **Rate Limiting**, and **CORS** for security

---

## 🧠 Features

- 🔐 Email/Password & Google Sign-In
- 📧 Email verification via Nodemailer
- 🛡️ JWT-based route protection
- ✅ Joi validation for all inputs
- 🔒 Password hashing & phone encryption
- 📨 Anonymous messaging system
- 📁 File uploads with Multer
- ☁️ Cloudinary integration
- 📊 Logging with Morgan
- 🧱 Modular architecture

---

## 📁 Project Structure

```
Saraha-App/
├── node_modules/
├── src/
│   ├── config/
│   ├── db/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   ├── message/
│   │   └── user/
│   ├── utils/
│   │   ├── constants/
│   │   ├── custom/
│   │   ├── email/
│   │   ├── events/
│   │   ├── handlers/
│   │   ├── multer/
│   │   └── security/
│   ├── app.controller.js
│   └── index.js
├── tmp/
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory and add the following:

```env
MOOD=
APP_NAME=

# DB
DB_URI=

# Express
PORT=

# Encryption
SECRETE_KEY=

# Hash
SALT_ROUND=

# Token Expiry
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=

# Token Keys
ACCESS_USER_TOKEN_KEY=
ACCESS_ADMIN_TOKEN_KEY=
REFRESH_USER_TOKEN_KEY=
REFRESH_ADMIN_TOKEN_KEY=

# Google Sign-In
CLIENT_IDS=

# Node Mailer
APP_EMAIL=
APP_PASSWORD=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# CORS
CORS_ORIGINS=
```

---

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/saraha-backend.git
   cd saraha-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure `.env` file**  
   Fill in the values as described above.

4. **Run the server**
   ```bash
   npm start
   ```

---

## 📌 Important Notes

- Gmail SMTP is used for sending verification emails.
- Cloudinary handles media uploads securely.
- JWT tokens are used for both user and admin authentication.
- All sensitive data is hashed or encrypted before storage.

---

## 📄 License

This project is licensed under the **MIT License**.
