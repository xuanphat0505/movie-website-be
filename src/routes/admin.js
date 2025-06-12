import express from "express";

import {
  updateAdminProfile,
  filterUsers,
  searchUsers,
  deleteUser,
  addNewUser,
  updateUser,
} from "../app/Controllers/AdminController.js";

const router = express.Router();

// Admin profile routes
router.put("/update-profile/:id", updateAdminProfile);

// User management routes
router.get("/users/filter", filterUsers);
router.get("/users/search", searchUsers);
router.delete("/users/:id", deleteUser);
router.post("/users/add", addNewUser);
router.put("/users/update/:id", updateUser);

export default router;


