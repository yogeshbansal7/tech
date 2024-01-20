const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.signup = async (req, res) => {
  try {
    console.log("entered in signup");
    const { username, email, password} =
      req.body;

    console.log(req.files);

    if ( !username || !email || !password ) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log("user signed");

    try {
      const emailResponse = await mailSender(
        email,
        "welcome to skin sight",
        `<p>Hi ${firstName} ${lastName},</p>`
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      user.token = token;
      user.password = undefined;
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    });
  }
};

exports.historycreate = async (req, res) => {
  
  try {
    const {dis} = req.files;
    const image = await uploadImageToCloudinary(
      dis,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log(image.secure_url)
    return res.status(200).json({
      success: true,
      image,
      message: `Image uploaded successfully`,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: `Image not uploaded`,
    });
  }
  const image = await uploadImageToCloudinary(
    dis,
    process.env.FOLDER_NAME,
    1000,
    1000
  );
  return;
};

exports.changePassword = async (req, res) => {
  try {
    console.log("Entered in change pass");
    const userDetails = await User.findById(req.user.id);
    console.log("start");
    console.log(userDetails);
    console.log("end");

    const { oldPassword, newPassword } = req.body;

    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
