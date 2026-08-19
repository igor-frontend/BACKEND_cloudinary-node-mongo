const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Post = require("../models/Post");
const User = require("../models/User");

dotenv.config();

const initialPosts = [
    { title: "Primer Post de la Comunidad", content: "Bienvenidos al backend de desarrollo." },
    { title: "Consejos sobre Node.js", content: "Modularizar correctamente tus rutas y controladores mantendrá limpio tu espacio de trabajo." },
    { title: "El ecosistema NoSQL", content: "MongoDB Atlas te permite escalar clusters rápidamente en entornos cloud compartidos." }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Conectado a MongoDB para la ejecución de la Semilla...");
        await Post.deleteMany();
        console.log("Colección Post limpiada correctamente.");
        let fallbackUser = await User.findOne();

        if (!fallbackUser) {
            fallbackUser = await User.create({
                username: "admin_seed",
                email: "seed_admin@school.com",
                password: "password_seguro_seed",
                role: "admin",
                image: ""
            });
            console.log("No existían usuarios previos. Se creó un usuario base Administrador para la semilla.");
        }
        const seedWithUser = initialPosts.map(post => ({
            ...post,
            user: fallbackUser._id
        }));

        const createdPosts = await Post.insertMany(seedWithUser);
        console.log(`Se han insertado exitosamente ${createdPosts.length} publicaciones de prueba.`);
        const postIds = createdPosts.map(p => p._id);
        await User.findByIdAndUpdate(fallbackUser._id, {
            $addToSet: { posts: { $each: postIds } }
        });
        console.log("Referencias sincronizadas perfectamente en la colección de Usuarios.");

    } catch (error) {
        console.error("Error ejecutando la semilla de posts:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Conexión con MongoDB cerrada tras finalizar la semilla.");
    }
};

seedDatabase();