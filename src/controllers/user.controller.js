const User = require("../models/User");
const { deleteCloudinaryFile } = require("../middlewares/upload.js"); 

const createUser = async (req, res) => {
    try {
        const userData = { ...req.body, role: "user" };
        if (req.file) {
            userData.image = req.file.path;
        }
        const user = await User.create(userData);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error creando usuario", error: error.message });
    }
};
const getUsers = async (req, res) => {
    try {
        const users = await User.find().populate("posts");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo usuarios", error: error.message });
    }
};
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("posts");
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo el usuario", error: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (role !== "user" && role !== "admin") {
            return res.status(400).json({ message: "Rol no válido" });
        }

        const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });

        res.status(200).json({ message: "Rol actualizado con éxito", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el rol", error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        delete req.body.role;
        delete req.body.posts;

        if (req.file) {
            const oldUser = await User.findById(id);
            if (oldUser && oldUser.image) {
                await deleteCloudinaryFile(oldUser.image);
            }
            req.body.image = req.file.path;
        }

        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Error actualizando el usuario", error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        if (currentUser.role !== "admin" && currentUser._id.toString() !== id) {
            return res.status(403).json({ message: "No tienes permisos para eliminar esta cuenta" });
        }
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        if (userToDelete.image) {
            await deleteCloudinaryFile(userToDelete.image);
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "Usuario e imagen eliminados correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error eliminando el usuario", error: error.message });
    }
};
module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUserRole,
    updateUser,
    deleteUser
};