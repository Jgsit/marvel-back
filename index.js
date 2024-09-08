// import express
const express = require("express");
const app = express();
app.use(express.json());

// configuration de dotenv
require("dotenv").config();

// import cors
const cors = require("cors");
app.use(cors());

// import mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);

// import de mes routeurs
const charaterRoutes = require("./routes/character");
const comicRoutes = require("./routes/comic");
const userRoutes = require("./routes/user");

// utilisation de mes routers
app.use(charaterRoutes);
app.use(comicRoutes);
app.use("/user", userRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
