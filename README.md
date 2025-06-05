# 🚀 VSAT CRM System

A lightweight **Customer Relationship Management (CRM)** system built for **VSAT Refurb Solutions Pvt. Ltd.** to streamline business operations like user registration, authentication, and secure data management.

---

## 🛠️ Tech Stack

- ⚙️ **Frontend:** HTML5, CSS3, Vanilla JavaScript  
- 🚀 **Backend:** Node.js, Express.js  
- 🗄️ **Database:** MySQL (`mysql2`)  
- 🔐 **Security:** bcrypt for password hashing  
- 📦 **Configuration:** dotenv for environment variables  

---
 ⚙️ Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/vsat-crm.git
   cd vsat-crm

2. **Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Configure `.env`**

   Create a `.env` file inside `/backend` and add your DB credentials.

4. **Run the Server**

   ```bash
   node server.js
   ```

5. **Access the App**

   Open your browser and go to:

   ```
   http://localhost:3000
   ```

---

## 🧪 Features

* 🔐 **User Signup & Login** with secure password hashing
* 📦 **MySQL database** integration with pooled connections
* ⚡ Fast & modular Express.js backend
* 🧭 Clean routing with JSON responses

---

## 🔧 Database Schema

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);
```

---

## 💡 Future Enhancements

* Role-based access (admin, sales, support)
* Session management or JWT-based auth
* Interactive UI dashboard
* Customer data CRUD functionality

---

## 🤝 Contributing

Feel free to fork and raise PRs to improve features or structure. All contributions are welcome!

---



## 📄 License

This project is licensed under the MIT License.

```

Let me know if you'd like me to add badges, a GIF demo, or link buttons (e.g., "Live Preview").
```
