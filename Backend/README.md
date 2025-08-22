# Smart City Community Portal – Backend

This is the backend API for the **Smart City Community Portal**, supporting user authentication, issue reporting, idea submissions, forum discussions, and admin moderation via a secure and scalable RESTful API.

---

## 🚀 Features

- ✅ **User Authentication** (JWT-based)
- 🧑‍💼 **Role-Based Access Control** (User/Admin)
- 📌 **Issue Reporting** with status tracking and location support
- 💡 **Idea Submission & Voting** with thresholds and review system
- 🧵 **Forum** (public/private) with thread and comment moderation
- 📈 **Stats API** for admin dashboard insights
- 📬 **Notification System** (email notifications optional)
- 🗂️ **Admin Controls**: approve/reject content, manage users/settings
- 📁 **File Uploads** (Multer for images)

---

## 🏗️ Tech Stack

- **Server**: Node.js + Express
- **Database**: MySQL (via `mysql2`)
- **Authentication**: JWT + bcrypt
- **File Uploads**: Multer
- **Environment Management**: dotenv
