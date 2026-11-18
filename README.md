# RoamNest 🏡

RoamNest is a full-stack Airbnb-inspired accommodation listing web application built using the MERN stack. It allows users to explore property listings, create their own listings, manage properties, write reviews, and view property locations on an interactive map.

## 🚀 Features

- User Registration, Login and Logout
- Create, Read, Update and Delete Listings
- Upload Listing Images using Cloudinary
- Review and Rating System
- Interactive Maps using Mapbox
- Booking Functionality (Demo)
- User Authentication and Authorization
- Session Management
- Responsive User Interface

## 🛠️ Tech Stack

### Frontend

- React.js
- React Router
- CSS
- Vite
- Mapbox GL JS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js
- Express Session

### Other Tools & Services

- Cloudinary
- Mapbox
- Nodemailer

## 📁 Project Structure

```text
RoamNest/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── app.js
│   └── package.json
│
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

```bash
cd RoamNest
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside the server folder and add your credentials:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASSWORD=
MAP_TOKEN=
ATLASDB_URL=
PORT=5000
SECRET=
```

Start the backend server:

```bash
npm start
```

### 3. Setup Frontend

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file inside the client folder:

```env
VITE_MAP_TOKEN=
```

Start the frontend:

```bash
npm run dev
```

## 🔐 Environment Variables

Make sure to configure your MongoDB Atlas, Cloudinary, Mapbox and other required credentials before running the application.

**Important:** Never upload your actual `.env` files or secret credentials to GitHub.

## 👨‍💻 Author

**Prashant Kumar**

🚀 Live Demo: https://roamnest-ut9w.onrender.com/

GitHub: [prashantbuildsdev-dev](https://github.com/prashantbuildsdev-dev)

LinkedIn: [Prashant Kumar](https://www.linkedin.com/in/prashant-kumar-4a9bb7352/)

---

⭐ If you find this project interesting, feel free to explore the repository!
