const express = require("express");
const router = express.Router();

const { signup, login, changePassword, historycreate } = require("../controllers/Auth");
const { auth } = require("../middleware/auth");

// Route for user signup
router.post("/signup", signup);
router.post("/login", login);
router.post("/historycreated", auth, historycreate)



module.exports = router;