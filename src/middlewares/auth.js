const jwt = require("jsonwebtoken");
const User = require("../models/User"); 
const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No autenticado. Falta el token/ID de usuario" });
        }
        const userId = authHeader.split(" ")[1];
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado. Autorización denegada" });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: "Error en la autenticación", error: error.message });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Acceso denegado. Se requieren permisos de Administrador" });
    }
};

module.exports = { isAuth, isAdmin };
