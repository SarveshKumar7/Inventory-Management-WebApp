const express = require("express");
const router = express.Router();
const {registerUser, LoginUser, logout} = require("../controllers/userController");


router.post("/register", registerUser);
router.post("/login", LoginUser);
router.get("/logout", logout);

module.exports = router;