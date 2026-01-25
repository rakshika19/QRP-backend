import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  {User}  from "../models/user.models.js";



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
  console.log(req.body);

  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");

  // Use .select("+password") to explicitly fetch the password field
  const existedUser = await User.findOne({ email }).select("+password");

  if (!existedUser) throw new ApiError(400, "User not found with this email");

  const passwordMatch = await existedUser.isPasswordCorrect(password);

  if (!passwordMatch) throw new ApiError(400, "Invalid password");

  // Generate both tokens
  const accessToken = await  existedUser.generateAccessToken();
  const refreshToken = await existedUser.generateRefreshToken();

  // Save refreshToken to database
  existedUser.refreshToken = refreshToken;
  await existedUser.save({ validateBeforeSave: false });

  // Get safe user without password and tokens
  const safeUser = await User.findById(existedUser._id)
    .select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          accessToken,
         
        },
        "User logged in successfully"
      )
    );
});


const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized");

  // Clear refreshToken from database
  await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });

  const options = {
    httpOnly: true,
    secure: false
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
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


