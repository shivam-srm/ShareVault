import { Router } from "express";
import {
  getUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  logoutUser,
} from "../controllers/user.controller.js";
import authenticate from "../middlewares/auth.middlewares.js";

const router = Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

// Authenticated
router.get("/user", authenticate, getUsers);
router.get("/user/:userId", authenticate, getUserById);
router.put("/user/:userId", authenticate, updateUser);
router.delete("/user/:userId", authenticate, deleteUser);

export default router;
