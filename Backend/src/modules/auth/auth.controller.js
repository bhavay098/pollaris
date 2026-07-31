import User from "./user.model.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";

import ApiError from "../../common/utils/api-error.js";
import ApiResponse from "../../common/utils/api-response.js";

const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw ApiError.badRequest("Email, password, and name are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw ApiError.conflict("User with this email already exists");
    }

    const user = await User.create({
      email,
      password,
      name,
    });

    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id,
      email: user.email,
    });

    res.cookie("accessToken", accessToken, cookieOptions);

    res.cookie("refreshToken", refreshToken, cookieOptions);

    const userWithoutPassword = user.toObject();

    delete userWithoutPassword.password;

    return ApiResponse.created(res, "User registered successfully", {
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest("Email and password are required");
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id,
      email: user.email,
    });

    res.cookie("accessToken", accessToken, cookieOptions);

    res.cookie("refreshToken", refreshToken, cookieOptions);

    const userWithoutPassword = user.toObject();

    delete userWithoutPassword.password;

    return ApiResponse.ok(res, "Login successful", {
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");

    res.clearCookie("refreshToken");

    return ApiResponse.ok(res, "Logout successful", null);
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw ApiError.badRequest("Refresh token is required");
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw ApiError.unauthorized("User not found");
    }

    const newAccessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
    });

    res.cookie("accessToken", newAccessToken, cookieOptions);

    return ApiResponse.ok(res, "Access token refreshed", null);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    return ApiResponse.ok(res, "Current user fetched", req.user);
  } catch (error) {
    next(error);
  }
};

export { register, login, logout, refreshAccessToken, getMe };
