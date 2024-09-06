// import express
const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

// route pour récupérer les offres
router.post("/signup", async (req, res) => {
  try {
    // Recherche dans la BDD. Est-ce qu'un utilisateur possède cet email ?
    const user = await User.findOne({ email: req.body.email });

    // Si oui, on renvoie un message et on ne procède pas à l'inscription
    if (user) {
      res.status(409).json({ message: "This email already has an account" });

      // sinon, on passe à la suite...
    } else {
      // l'utilisateur a-t-il bien envoyé les informations requises ?
      if (req.body.email && req.body.password && req.body.username) {
        const token = uid2(64);
        const salt = uid2(64);
        const hash = SHA256(req.body.password + salt).toString(encBase64);

        const newUser = new User({
          email: req.body.email,
          token: token,
          hash: hash,
          salt: salt,
          account: { username: req.body.username },
          favoris: [],
        });

        await newUser.save();
        res.status(201).json({
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(400).json({ message: "Missing parameters" });
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
    } else {
      if (
        SHA256(req.body.password + user.salt).toString(encBase64) === user.hash
      ) {
        res
          .status(200)
          .json({ _id: user._id, token: user.token, account: user.account });
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

router.put("/favoris", async (req, res) => {
  const { token, id, isCharacter } = req.body;

  try {
    const user = await User.findOne({ token: token });
    if (user.favoris.length === 0) {
      if (isCharacter) {
        const response = await axios.get(
          `https://lereacteur-marvel-api.herokuapp.com/character/${id}?apiKey=${process.env.API_KEY}`
        );
        user.favoris.push({
          _id: response.data._id,
          name: response.data.name,
          description: response.data.description,
          picture: `${response.data.thumbnail.path}/portrait_uncanny.${response.data.thumbnail.extension}`,
        });
      } else {
        const response = await axios.get(
          `https://lereacteur-marvel-api.herokuapp.com/comic/${id}?apiKey=${process.env.API_KEY}`
        );

        user.favoris.push({
          _id: response.data._id,
          title: response.data.title,
          description: response.data.description,
          picture: `${response.data.thumbnail.path}/portrait_uncanny.${response.data.thumbnail.extension}`,
        });
      }
    } else {
      let isInclude = false;
      for (let i = 0; i < user.favoris.length; i++) {
        if (user.favoris[i]._id === id) {
          user.favoris.splice(i, 1);
          isInclude = true;
        }
      }
      if (!isInclude) {
        if (isCharacter) {
          const response = await axios.get(
            `https://lereacteur-marvel-api.herokuapp.com/character/${id}?apiKey=${process.env.API_KEY}`
          );
          user.favoris.push({
            _id: response.data._id,
            name: response.data.name,
            description: response.data.description,
            picture: `${response.data.thumbnail.path}/portrait_uncanny.${response.data.thumbnail.extension}`,
          });
        } else {
          const response = await axios.get(
            `https://lereacteur-marvel-api.herokuapp.com/comic/${id}?apiKey=${process.env.API_KEY}`
          );
          user.favoris.push({
            _id: response.data._id,
            title: response.data.title,
            description: response.data.description,
            picture: `${response.data.thumbnail.path}/portrait_uncanny.${response.data.thumbnail.extension}`,
          });
        }
      }
    }

    await user.save();
    res.status(200).json({ favoris: user.favoris });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/favoris", async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token: token });
    if (user) {
      res
        .status(200)
        .json({ count: user.favoris.length, favoris: user.favoris });
    } else {
      res.status(400).json({ message: "Pas d'utilisateur avec ce token" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
