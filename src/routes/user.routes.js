const express = require("express");
const { upload } = require("../middlewares/upload.js");
const { isAuth, isAdmin } = require("../middlewares/auth");
const {
    loginUser,
    createUser,
    getUsers,
    getUserById,
    updateUserRole,
    updateUser,
    deleteUser
} = require("../controllers/user.controller.js");

const router = express.Router();

router.post("/register", upload.single("image"), createUser);
router.post("/login", loginUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", isAuth, upload.single("image"), updateUser);
router.delete("/:id", isAuth, deleteUser);
router.patch("/:id/role", isAuth, isAdmin, updateUserRole);

module.exports = router;
