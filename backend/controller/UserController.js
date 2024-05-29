const express = require("express");
const User = require("../model/User");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");

const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { LocalStorage } = require("node-localstorage");
const crypto = require('crypto');


// create user
router.post("/create-user", async (req, res, next) => {
  console.log("creating user");
  try {
    const { name, email, password, avatar } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }
    const newUser = new User({
      name: name,
      email: email,
      password: password,
    });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: `Account Created Successfully`,
      user: newUser, // You might want to pass the generated token in the response
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// async function createAndStoreToken(newUser, res) {
//   let token = generateOTP();
//   console.log("Generated OTP: " + token);

//   let expiryDate = new Date();
//   expiryDate.setDate(expiryDate.getDate() + 1); 
//   res.cookie('otp', token, {
//     httpOnly: true,
//     expires: expiryDate,
//     secure: false, // for HTTPS only
//     sameSite: 'none',
//   });

//   try {
//     await sendMail({
//       email: newUser.email,
//       subject: "Activate your account",
//       message: `Hello ${newUser.name}, Here is Account Activation OTP : ${token}`,
//     });
//   } catch (error) {
//     // You might want to handle the error here or propagate it up
//     console.error("Error sending email:", error);
//   }

//   console.log("Token stored in cookie.");
//   return token; // You might want to return the token for further use
// }
// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000);
// }


// login user
router.post(
  "/login-user",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }
      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load user
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// log out user
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);



module.exports = router;
