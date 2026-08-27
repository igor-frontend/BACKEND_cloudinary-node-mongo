const express = require("express");
const { isAuth } = require("../middlewares/auth");
const {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost
} = require("../controllers/post.controller.js");

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPostById);

// VERIFICACIÓN ESTRICTA: Re-inyección de seguridad obligatoria por tokens en endpoints de escritura
router.post("/", isAuth, createPost);
router.put("/:id", isAuth, updatePost);
router.delete("/:id", isAuth, deletePost);

module.exports = router;
