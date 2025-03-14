const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all required fields");
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least six characters");
    }

    // Check if email is already registered
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("Email has already been registered");
    }

    // Create new user
    const user = await User.create({
        name,
        email,
        password,
    });

    // Generate Token
    const token = generateToken(user._id);

    // Send HTTP-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 86400 * 1000), // 1 day
        sameSite: "none",
        secure: true
    });

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(201).json({ _id, name, email, photo, phone, bio, token });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// Login User
const LoginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
        res.status(400);
        throw new Error("Please add Email and Password");
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error("User not found, please signup");
    }

    // Validate password
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (passwordIsCorrect) {
        const token = generateToken(user._id);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            phone: user.phone,
            bio: user.bio,
            token,
        });
    } else {
        res.status(400);
        throw new Error("Invalid Email or Password");
    }
});

// Logout User
const logout = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true
    });
    return res.status(200).json({ message: "Successfully Logged Out" });
});

// Get User Data
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({ _id, name, email, photo, phone, bio });
    } else {
        res.status(400);
        throw new Error("User not Found");
    }
});

// Check Login Status
const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false);
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        return res.json(!!verified);
    } catch (error) {
        return res.json(false);
    }
});

// Update User
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        user.bio = req.body.bio || user.bio;
        user.photo = req.body.photo || user.photo;

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { oldPassword, password } = req.body;

    if (!user) {
        res.status(400);
        throw new Error("User not found, please signup");
    }

    if (!oldPassword || !password) {
        res.status(400);
        throw new Error("Please add old and new password");
    }

    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);
    if (passwordIsCorrect) {
        user.password = password;
        await user.save();
        res.status(200).send("Password Changed Successfully");
    } else {
        res.status(400);
        throw new Error("Old Password is Incorrect");
    }
});

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error("User does not exist");
    }

    //Delete token if it exists in DB
    let token = await Token.findOne({userId: user._id})
    if(token){
        await token.deleteOne()
    }

    // Create Reset Token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
    console.log(resetToken);

    // Hash token before saving to DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save Token to DB
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    }).save();

    // Construct Reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    // Reset Email
    const message = `
    <h2>Hello ${user.name}</h2>
    <p>Please use the URL below to reset your password:</p>
    <p>This reset link is valid for 30 Minutes.</p>
    <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
    <p>Regards,</p>
    <p>Pinvent Team</p>
    `;

    const subject = "Password Reset Request";
    const sent_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    try {
        await sendEmail(subject, message, sent_to, sent_from, sent_from);
        res.status(200).json({ success:true, message: "Password reset email sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error("Email could not be sent");
    }
});
// Reset password 

const resetpassword = asyncHandler(async (req,res) => {
    
    const {password} = req.body;
    const {resetToken} = req.params;

    // Hash token, then compare to Token in DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //find Token in DB 
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {$gt: Date.now()}
    })

    if(!userToken){
        res.status(404);
        throw new Error("Invalid or Expired Token");
    }

    //Find user 
    const user = await User.findOne({_id: userToken.userId});
    user.password = password;
    await user.save()
    res.status(200).json({
        message: "Password Reset successfull, Please Login"
    })

});

module.exports = {
    registerUser,
    LoginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetpassword,
};
