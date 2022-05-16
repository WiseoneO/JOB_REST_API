const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const userSchema = new mongoose.Schema({
    name  : {
        type : String,
        required : [true, "Please Enter Your Name."]
    },
    email : {
        type : String,
        required : [true, "Please Enter Your email Address"],
        unique : true,
        validate : [validator.isEmail, "Please enter a valid email address"]
    },
    role : {
        type : String,
        required : [true, " Please select role"],
        enum : {
            values : ["user", "employer"],
            message : "Please select correct role."
        },
        default : "user"
    },
    password : {
        type : String,
        required : [true, "Please enter password for your account"],
        minlength : [8, "Your password must be at least 8 character long"],
        select : false,
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    resetPasswordToken : String,
    resetPasswordExpire : Date
});

// Encrypting the password before saving
userSchema.pre("save", async function(next){

    if(!this.isModified("password")){
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
})

// Return JSON web Token
userSchema.methods.getJwtToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_TIME
    })
}

// Compare user password in the database password
userSchema.methods.comparePassword = async function(enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
}

// Password reset token
userSchema.methods.getResetPasswordToken = function(){
    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

    // Set token expire time
    this.resetPasswordExpire = Date.now() + 30*60*1000;

    return resetToken
}


module.exports = mongoose.model("User",userSchema);