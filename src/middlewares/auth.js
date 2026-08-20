const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No autenticado. Falta el token en formato Bearer" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "clave_secreta_por_defecto");

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado", error: error.message });
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
