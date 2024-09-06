// import express
const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();

// route pour récupérer les offres
router.get("/characters", async (req, res) => {
  const { skip, limit, name } = req.query;
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.API_KEY}&skip=${skip}&limit=${limit}&name=${name}`
    );
    const result = [];
    const data = response.data.results;
    for (let i = 0; i < data.length; i++) {
      const picture = data[i].thumbnail
        ? `${data[i].thumbnail.path}/standard_xlarge.${data[i].thumbnail.extension}`
        : null;
      const object = {
        name: data[i].name,
        description: data[i].description,
        picture: picture,
        _id: data[i]._id,
      };
      result[i] = object;
    }
    res.json({ count: response.data.count, result: result });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

router.get("/character/:id", async (req, res) => {
  const { id } = req.params;
  function getComics() {
    return axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics/${id}?apiKey=${process.env.API_KEY}`
    );
  }
  function getCharacter() {
    return axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/character/${id}?apiKey=${process.env.API_KEY}`
    );
  }
  try {
    const results = await Promise.all([getComics(), getCharacter()]);

    const comics = results[0];
    const comicsResult = [];
    let data = comics.data;
    for (let i = 0; i < data.comics.length; i++) {
      const picture = data.comics[i].thumbnail
        ? `${data.comics[i].thumbnail.path}/standard_xlarge.${data.comics[i].thumbnail.extension}`
        : null;
      const object = {
        title: data.comics[i].title,
        description: data.comics[i].description,
        picture: picture,
        _id: data.comics[i]._id,
      };
      comicsResult[i] = object;
    }

    const character = results[1];
    data = character.data;
    const picture = data.thumbnail
      ? `${data.thumbnail.path}/portrait_uncanny.${data.thumbnail.extension}`
      : null;

    const characterResult = {
      name: data.name,
      description: data.description,
      picture: picture,
    };
    res.json({ character: characterResult, comics: comicsResult });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;
