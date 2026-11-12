const express = require("express");
const router = express.Router();

const userController = require("../controllers/users.js");

// Signup
router.post("/signup", userController.signup);

// Login
router.post("/login", userController.login);

// Logout
router.post("/logout", userController.logout);

// Current logged-in user
router.get("/me", userController.currentUser);

module.exports = router;