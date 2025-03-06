const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email: {
        type: String,
        required: [true, "Please add a email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,"Please enter a valid email"
        ] //E-mail verification
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minLength: [6, "Password must be upto 6 characters"],
        maxLength: [23, "Password must not be more than 23 characters"],
    },
    photo: {
        type: String,
        required: [true, "Please add a photo"],
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7ON0Qbmq_1dlIIgwWOsLNe9j5Bfjt3NM3jQ&s"
    },
    phone: {
        type: String,
        default: "+91"
    },
    bio: {
        type: String,
        maxLength: [250, "Bio must not be more than 250 Characters"],
        default: "bio"
    }
},{
    timestamps:true,
})

const user = mongoose.model("User", userSchema)
module.exports =User