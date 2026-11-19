# 🏢 SocietySphere – Society Management System

A full-stack MERN application designed to simplify and digitize residential society management. SocietySphere provides a centralized platform to manage residents, visitors, complaints, and society notices efficiently.

## 🚀 Features

- **User Authentication:** Secure user login and authentication.
- **Dashboard:** Centralized dashboard for society management.
- **People Management:** Manage and view society residents.
- **Complaint Management:** Submit, manage, and track resident complaints.
- **Notice Management:** Create and view important society announcements.
- **Visitor Management:** Maintain visitor information and records.
- **Society Management:** Organize society-related information.
- **Responsive UI:** User-friendly interface for different screen sizes.

## 🛠️ Tech Stack

**Frontend**

- React.js
- JavaScript
- Tailwind CSS
- HTML5
- CSS3
- Vite

**Backend**

- Node.js
- Express.js
- REST APIs
- JWT Authentication

**Database**

- MongoDB
- Mongoose

**Tools**

- Git
- GitHub
- VS Code
- npm

## 📁 Project Structure

```text
SocietySphere/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

Follow these steps to run SocietySphere locally.

### 1. Clone the Repository

```bash
git clone https://github.com/Suha673/SocietySphere.git
```

### 2. Navigate to the Project

```bash
cd SocietySphere
```

### 3. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder and configure your environment variables.

Example (use the exact variable names required by your backend code):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend using the development script configured in `backend/package.json`:

```bash
npm run dev
```

### 4. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Configure the frontend API URL if required by your application.

Start the frontend:

```bash
npm run dev
```

### 5. Open the Application

Open the local URL displayed by Vite in your browser, usually:

```text
http://localhost:5173
```

## 🔐 Environment Variables

Keep all actual environment variables and credentials private.

- Never upload your real MongoDB connection string.
- Never expose your JWT secret.
- Use `.env.example` to document the required variables without real credentials.

## 🎯 Project Objective

The main objective of SocietySphere is to provide a centralized digital solution for residential society operations, reducing manual work and making communication and management more organized.

## 🔮 Future Enhancements

- Online maintenance payment integration.
- Email and notification system.
- Advanced analytics and reporting.
- Role-based access control enhancements.
- Real-time visitor notifications.

## 👨‍💻 Developer

**Suhani Patel**

GitHub: [@Suha673](https://github.com/Suha673)

## 📄 License

This project is available for learning and educational purposes.
