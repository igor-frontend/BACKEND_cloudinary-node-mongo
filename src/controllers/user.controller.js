const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { deleteCloudinaryFile } = require("../middlewares/upload.js");
const Post = require("../models/Post");

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Credenciales incorrectas" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Credenciales incorrectas" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "clave_secreta_por_defecto", { expiresIn: "1d" });

        res.status(200).json({
            message: "Login exitoso",
            token,
            user: { id: user._id, username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el login", error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const userData = { ...req.body, role: "user" };
        if (req.file) {
            userData.image = req.file.path;
        }

        const user = await User.create(userData);
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: "Error creando usuario", error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find().populate("posts").select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo usuarios", error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("posts").select("-password");
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

        const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
        if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });

        res.status(200).json({ message: "Rol actualizado con éxito", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el rol", error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        if (currentUser.role !== "admin" && currentUser._id.toString() !== id) {
            return res.status(403).json({ message: "No tienes permisos para modificar este perfil" });
        }
        
        const userToUpdate = await User.findById(id);
        if (!userToUpdate) return res.status(404).json({ message: "Usuario no encontrado" });

        delete req.body.role;
        delete req.body.posts;

        // CORRECCIÓN REHASHEO: Solo se modifica la propiedad si el usuario envía una nueva contraseña real
        if (req.body.password && req.body.password.trim() !== "") {
            userToUpdate.password = req.body.password;
        }

        if (req.file) {
            if (userToUpdate.image) {
                await deleteCloudinaryFile(userToUpdate.image);
            }
            userToUpdate.image = req.file.path;
        }
        Object.keys(req.body).forEach((key) => {
            if (key !== "password") {
                userToUpdate[key] = req.body[key];
            }
        });

        // Ejecuta el hook nativo pre("save") del modelo de forma segura
        await userToUpdate.save();

        const responseUser = userToUpdate.toObject();
        delete responseUser.password;

        res.status(200).json(responseUser);
    } catch (error) {
        res.status(500).json({ message: "Error actualizando el usuario", error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        // CORRECCIÓN VALIDACIÓN: Evita que cualquier usuario logueado borre a otro
        if (currentUser.role !== "admin" && currentUser._id.toString() !== id) {
            return res.status(403).json({ message: "No tienes permisos para eliminar este perfil" });
        }

        const userToDelete = await User.findById(id);
        if (!userToDelete) return res.status(404).json({ message: "Usuario no encontrado" });

        // CORRECCIÓN IMAGEN HUÉRFANA: Se purga el archivo de Cloudinary antes de borrar el documento de la BBDD
        if (userToDelete.image) {
            await deleteCloudinaryFile(userToDelete.image);
        }

        await User.findByIdAndDelete(id);
        await Post.deleteMany({ user: id }); 
        
        res.status(200).json({ message: "Usuario y todos sus posts eliminados en cascada con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error en el borrado", error: error.message });
    }
};

module.exports = {
    loginUser,
    createUser,
    getUsers,
    getUserById,
    updateUserRole,
    updateUser,
    deleteUser
};
