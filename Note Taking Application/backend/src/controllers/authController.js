import authService from "../services/authService.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/auth.js";

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const user = await authService.login(email, password);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userid: user.userid,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

// Register user
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const newUser = await authService.register(email, password);

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });
  } catch (error) {
    if (error.message === "Email is already registered") {
      return res.status(409).json({
        error: error.message
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
};

export default {
  login, register
};