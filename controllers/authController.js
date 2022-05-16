const User = require("../model/users");
const catchAsyncErrors = require("../middlwweares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

// Register a new user => /api/v1/register
exports.registerUser = catchAsyncErrors( async (req, res, next)=>{
    const {name, email, password, role} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendToken(user, 200, res);

});

// Login user =/api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next)=>{
    const {email,password} = req.body;

    // checks if email or password is entered by user
    if(!email || !password){
        return next(new ErrorHandler("Please enter email or password"), 400)
    }

    //Finding user in the database
    const user  = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalidemail or password",401))
    }

    // check if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    sendToken(user, 200, res);

});

// Forgot password => /api/v1/password/forgot

exports.forgotPassword = catchAsyncErrors( async (req, res, next)=>{
    const user = await User.findOne({email : req.body.email});

    // check user email in database
    if(!user){
        return next(new ErrorHandler("No user found with this email", 404));
    };

    // get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave : false});    

    // Create reset password url

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset link is as follow:\n\n${resetUrl}\n\n If you havenot requested this, then please ignore that.`

    try {
        await sendEmail({
            email : user.email,
            subject : "Password Recovery",
            message
        });

        res.status(200).json({
            success : true,
            message : `Email sent successfully to: ${user.email}`
        })
    }catch(error){
        user,getResetPasswordToken = undefined;
        user,getResetPasswordExpire = undefined;

        await user.save({validateBeforeSave : false});

        return next(new ErrorHandler("Email is not sent"), 500)
    }

});