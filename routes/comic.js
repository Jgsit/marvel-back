// import express
const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();

// route pour récupérer les comics
router.get("/comics", async (req, res) => {
  const { skip, limit, title } = req.query;
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.API_KEY}&skip=${skip}&limit=${limit}&title=${title}`
    );
    const result = [];
    const data = response.data.results;
    for (let i = 0; i < data.length; i++) {
      const picture = data[i].thumbnail
        ? `${data[i].thumbnail.path}/standard_xlarge.${data[i].thumbnail.extension}`
        : null;
      const object = {
        title: data[i].title,
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

module.exports = router;
