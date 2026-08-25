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
        const { title, content } = req.body;

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: "Post no encontrado" });
        if (post.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Acceso denegado. No eres el creador de este post ni administrador" });
        }
        if (title) post.title = title;
        if (content) post.content = content;
        await post.save();

        res.status(200).json({ message: "Post actualizado con éxito", post });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el post", error: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: "Post no encontrado" });
        if (post.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Acceso denegado. No tienes permisos para borrar este post" });
        }

        await Post.findByIdAndDelete(id);

        await User.findByIdAndUpdate(post.user, {
            $pull: { posts: id }
        });
        res.status(200).json({ message: "Post eliminado correctamente de la base de datos" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el post", error: error.message });
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost
};
