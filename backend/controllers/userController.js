const asyncHandler = require("express-async-handler");
const User = require("../models/userModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


const genratetoken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
};
 
//Register User
const registerUser = asyncHandler( async (req, res) => {
    const {name, email, password} = req.body 

    //validation
    if(!name || !email || !password){
        res.status(400)
        throw new Error("Please fill in all required fields")
    }
    if(password.length < 6){
        res.status(400)
        throw new Error("Password may be upto six characters")
    }

    //check if user email already exists
    const userExists = await User.findOne({email})
    if(userExists){
        res.status(400)
        throw new Error("Email has already been registered")
    }

    // create new user
    const user = await User.create({
        name,
        email,
        password,
    });

     //Generate Token
     const token = genratetoken(user._id);

     // Send HTTP-only cookie
     res.cookie("token",token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now()+1000 * 86400), //1 day
        sameSite: "none",
        secure: true
     });

    if(user){
        const {_id, name, email, photo, phone, bio} = user
        res.status(201).json({
            _id, 
            name, 
            email, 
            photo, 
            phone, 
            bio, 
            token,
        });
    } else{
        res.status(400)
        throw new Error("Invalid user data")
    }
});
//Login User
const LoginUser = asyncHandler(async (req, res) => {
    const {email, password}= req.body

    //validate request
    if(!email || !password){
        res.status(400);
        throw new Error("Please add Email and Password");
    }

    //check if user exists
    const user = await User.findOne({email})
    if(!user){
        res.status(400);
        throw new Error("User not found, please signup");
    }

    //user exists, check if password is correct
    const passwordIscorrect = await bcrypt.compare(password, user.password)
    if (user && passwordIscorrect) {
        res.status(200).json({
            _id, 
            name, 
            email, 
            photo, 
            phone, 
            bio, 
            token,
        });
    } else{
        res.status(400);
        throw new Error("Ivalid Email or Password");
    }
});

//logout user 
const logout = asyncHandler (async (req,res)=> {
    res.cookie("token","", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true
     });
     return res.status(200).json({ message: "Successfully Logged Out"});
});
//Get User Data
const getUser = asyncHandler(async(req,res)=>{
  const user = await User.findById(req.user._id)

  if(user){
    const {_id, name, email, photo, phone, bio} = user
    res.status(201).json({
        _id, 
        name, 
        email, 
        photo, 
        phone, 
        bio, 
    });
} else{
    res.status(400);
    throw new Error("User not Found");
}

});

//get Login Status

const loginStatus = asyncHandler (async (req , res ) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false);
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
        return res.json(true);
    }
    return res.json(false);
});

module.exports ={
    registerUser,
    LoginUser,
    logout,
    getUser,
    loginStatus,
};