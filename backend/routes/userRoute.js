const express = require("express");
const router = express.Router();
const {registerUser, LoginUser, logout, getUser, loginStatus, updateUser, changePassword, forgotPassword, resetpassword} = require("../controllers/userController");
const protect = require("../middleWare/authMiddleware");


router.post("/register", registerUser);
router.post("/login", LoginUser);
router.get("/logout", logout);
router.get("/getuser", protect, getUser);
router.get("/loggedin", loginStatus);
router.patch("/updateuser", protect, updateUser);
router.patch("/changepassword", protect, changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetpassword);
module.exports = router;