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
        res.status(500).json({ message: "Error obteniendo las publicaciones", error: error.message });
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("user", "username email role");
        if (!post) return res.status(404).json({ message: "Publicación no encontrada" });
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo la publicación", error: error.message });
    }
};

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const oldPost = await Post.findById(id);
        if (!oldPost) return res.status(404).json({ message: "Publicación no encontrada" });

        if (req.body.user && req.body.user !== oldPost.user.toString()) {
            const newAuthorExists = await User.findById(req.body.user);
            if (!newAuthorExists) return res.status(404).json({ message: "El nuevo autor no existe" });

            await User.findByIdAndUpdate(oldPost.user, { $pull: { posts: oldPost._id } });
            await User.findByIdAndUpdate(req.body.user, { $addToSet: { posts: oldPost._id } });
        }

        const updatedPost = await Post.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Error actualizando la publicación", error: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Publicación no encontrada" });

        await User.findByIdAndUpdate(post.user, {
            $pull: { posts: post._id }
        });

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Publicación eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error  publicación", error: error.message });
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost
};
