const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes.js");
const postRoutes = require("./routes/post.routes.js");

const app = express();
app.use(express.json());

app.use("/users", userRoutes);
app.use("/posts", postRoutes);

const PORT = process.env.PORT || 3030;

app.get("/", (req, res) => {
    res.send("Backend funcionando perfectamente y modularizado.");
});

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("No se pudo iniciar el servidor debido a un fallo de conexión:", error);
    });
