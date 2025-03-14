const express = require("express");
const router = express.Router();
const {registerUser, LoginUser, logout, getUser, loginStatus, updateUser, changePassword} = require("../controllers/userController");
const protect = require("../middleWare/authMiddleware");


router.post("/register", registerUser);
router.post("/login", LoginUser);
router.get("/logout", logout);
router.get("/getuser", protect, getUser);
router.get("/loggedin", loginStatus);
router.get("/updateuser", protect, updateUser);
router.get("/changepassword", protect, changePassword);

module.exports = router;