const express = require("express");
const router = express.Router();
const {registerUser, LoginUser, logout, getUser} = require("../controllers/userController");
const protect = require("../middleWare/authMiddleware");


router.post("/register", registerUser);
router.post("/login", LoginUser);
router.get("/logout", logout);
router.get("/getuser", protect, getUser);

module.exports = router;