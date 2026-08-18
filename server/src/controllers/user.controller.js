import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const generateUniqueId = () => uuidv4();

// ---------- Validation schemas ----------
const registerSchema = z.object({
  fullname: z.string().trim().min(6, "Fullname must be at least 6 characters long.").max(100),
  email: z.string().trim().email("Invalid email format.").max(255),
  password: z.string().min(6, "Password must be at least 6 characters long.").max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255).optional(),
  username: z.string().trim().min(1).max(60).optional(),
  password: z.string().min(1).max(128),
}).refine((d) => d.email || d.username, {
  message: "Email or username is required.",
});

// ---------- Handlers ----------
const registerUser = async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const { fullname, email, password } = parsed.data;

  try {
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const cleanedFullname = fullname.trim().replace(/\s+/g, "");
    const username = `${cleanedFullname.substring(0, 4).toLowerCase()}${generateUniqueId().substring(0, 5)}`;

    const pic = Math.floor(Math.random() * 100) + 1;
    const profilePic = `https://avatar.iran.liara.run/public/${pic}`;

    const newUser = new User({ fullname, username, email, password, profilePic });
    newUser.lastLogin = new Date();
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic,
        lastLogin: newUser.lastLogin,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Error during registration" });
  }
};

const logoutUser = async (_req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Error during logout" });
  }
};

// Admin-only in practice — kept authenticated. Do not leak password hashes.
const getUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    // Authenticated user may only read their own record.
    if (req.user?.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { username } = req.body;
  try {
    if (req.user?.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!username || typeof username !== "string" || username.trim().length < 1 || username.length > 60) {
      return res.status(400).json({ message: "Username is required (1-60 chars)" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: username.trim() },
      { new: true }
    ).select("-password");
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    if (req.user?.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};

const loginUser = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const { email, username, password } = parsed.data;

  try {
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (!user) return res.status(401).json({ message: "Invalid email or username" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
    user.lastLogin = new Date();
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.userId;
    next();
  });
};

export {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  verifyToken,
  generateUniqueId,
  logoutUser,
};
