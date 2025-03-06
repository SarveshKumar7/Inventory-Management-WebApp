const registerUser = async (req, res) => {
     if(!req.body.email){
        res.status(400);
        throw new Error("Please add an E-mail");
     }
     res.send("Registered User");
};

module.exports ={
    registerUser,
};