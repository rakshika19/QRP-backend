import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"


const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }
  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }
  if (!password?.trim()) {
    throw new ApiError(400, "Password is required");
  }


  const validRoles = ['user', 'admin'];
  const userRole = role || 'user'; 
  if (!validRoles.includes(userRole)) {
    throw new ApiError(400, "Role must be either 'user' or 'admin'");
  }

  // Check if email exists
  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    throw new ApiError(409, "Email is already registered");
  }

  // Check if username exists
  const existingUserByUsername = await User.findOne({ username });
  if (existingUserByUsername) {
    throw new ApiError(409, "Username is already taken");
  }

  const user = await User.create({
    username,
    email,
    password,
    role: userRole,
  });

  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken");
    
  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering user")
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(404, "Invalid credentials");

  // Generate new token and save (invalidate previous)
  const accessToken = user.generateAccessToken(user._id);
  user.accessToken = accessToken;
  await user.save();

  console.log(accessToken)

  const options = {
    httpOnly: true,
    secure: false
  }

  const loggedUser = await User.findById(user._id)
    .select("-password -accessToken");

  return res
    .status(200)
    .cookie("token", accessToken, options)
    .json(new ApiResponse(200, loggedUser, "User logged in successfully"));
});


const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized");

  await User.findByIdAndUpdate(userId, { accessToken: null });

  const options = {
    httpOnly: true,
    secure: false
  }

  return res
    .status(200)
    .clearCookie("token", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password -accessToken").sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export { registerUser, loginUser, logoutUser, getAllUsers };


