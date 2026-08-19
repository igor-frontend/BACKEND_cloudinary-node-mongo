const Post = require("../models/Post");
const User = require("../models/User");

const createPost = async (req, res) => {
    try {
        const { title, content, user } = req.body;
        const associatedUser = await User.findById(user);
        if (!associatedUser) {
            return res.status(404).json({ message: "El usuario asociado al post no existe" });
        }
        const newPost = await Post.create({ title, content, user });
        await User.findByIdAndUpdate(user, {
            $addToSet: { posts: newPost._id }
        });

        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: "Error creando la publicación", error: error.message });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("user", "username email role");
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo las publicaciones", error: error.message

        });
    }
};
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("user", "username email role");
        if (!post) return res.status(404).json({
            message: "Publicación no encontrada"
        });
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({
            message: "Error obteniendo la publicación", error: error.message
        });
    }
};
const updatePost = async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPost) return res.status(404).json({
            message: "Publicación no encontrada"
        });
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({
            message: "Error actualizando la publicación", error: error.message });
    }
};
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({
            message: "Publicación no encontrada"
        });
        await User.findByIdAndUpdate(post.user, {
            $pull: { posts: post._id }
        });
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Publicación eliminada correctamente" });
    } catch (error) {
        res.status(500).json({
            message: "Error eliminando la publicación", error: error.message
        });
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost
};