const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const userRoutes = require("./routes/user.routes.js");
const postRoutes = require("./routes/post.routes.js");

const app = express();

app.use(express.json());
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

const PORT = process.env.PORT || 3030;

app.get("/", (req, res) => {
    res.send("Backend funcionando");
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB conectado");

        app.listen(PORT, () => {
            console.log(`Servidor funcionando en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error conectando a MongoDB:", error);
    });



