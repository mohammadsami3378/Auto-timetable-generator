# 🧠 AutoSched AI — Intelligent Time Table Generator

AutoSched AI is a modern, AI-inspired Time Table Generator that automatically creates optimized, conflict-free schedules based on user-defined constraints. Designed for students, teachers, and institutions, the system ensures efficient time management through smart scheduling logic and a clean user experience.

---

## 🚀 Key Features

* 🔐 **Secure Authentication** — User registration & login using JWT and bcrypt
* 📅 **Automatic Scheduling** — Generates smart timetables based on inputs
* ⚡ **Conflict-Free Logic** — Avoids overlaps and ensures balanced distribution
* 📊 **Smart Allocation** — Prioritizes subjects and manages weekly hours
* 🧑‍🏫 **Teacher & Subject Mapping** — Handles multiple subjects and instructors
* 💾 **Persistent Storage** — Data stored securely in MongoDB
* 🌐 **Responsive UI** — Built with React and Tailwind CSS
* 🔄 **Edit & Regenerate** — Modify and regenerate schedules anytime

---

## 🛠️ Technology Stack

| Layer          | Technology Used              |
| -------------- | ---------------------------- |
| Frontend       | React.js, Tailwind CSS       |
| Backend        | Node.js, Express.js          |
| Database       | MongoDB (Mongoose)           |
| Authentication | JSON Web Token (JWT), bcrypt |

---

## 📂 Project Architecture

```
auto-sched-ai/
│
├── client/                 # React Frontend
│   ├── src/
│   └── public/
│
├── server/                 # Backend (Node + Express)
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   └── server.ts
│
├── .env                    # Environment Variables
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/auto-sched-ai.git
cd auto-sched-ai
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/timetableDB
JWT_SECRET=your_secure_secret_key
PORT=3000
```

### 4️⃣ Run Application

```bash
npm run dev
```

---

## 🔐 Authentication Workflow

1. User registers with name, email, and password
2. Password is securely hashed using bcrypt
3. On login, a JWT token is generated
4. Token is stored on the client side
5. Protected routes require valid authentication token

---

## 🎯 Practical Use Cases

* Academic Institutions (Schools & Colleges)
* Teachers managing class schedules
* Students organizing study plans
* Automated scheduling systems

---

## 📌 Future Enhancements

* 📄 Export timetable as PDF
* 🤖 AI/ML-based schedule optimization
* 🖱️ Drag-and-drop timetable editor
* 👥 Role-based access control (Admin / Teacher / Student)
* 📊 Analytics dashboard for schedule efficiency

---

## 🤝 Contribution Guidelines

Contributions are welcome!
Feel free to fork the repository and submit pull requests to improve the project.

---

## 📜 License

This project is open-source and available for educational and development purposes.

---

## 👨‍💻 Author

**Mahmmadsami M Bilagi**
Passionate Developer | MERN Stack Enthusiast | AI-Based Project Builder

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub to support development.
