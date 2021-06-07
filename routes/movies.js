const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate_middleware = require('../middleware/validate');
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');

router.get('/', async function(req, res) {
    const movies = await Movie
        .find()
        .sort('title')
        .select('title genre.name numerInStock dailyRentalRate');

    res.send(movies);
});

router.get('/:id', async function(req, res) {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) return res.status(404).send('The movie with the given ID was not found.');
    
    res.send(movie);
});

router.post('/', [auth, validate_middleware(validate)], async function(req, res) {
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send('Invalid genre.');

    const movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
          },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });

    await movie.save();
    res.send(movie);
});

router.put('/:id', [auth, validate_middleware(validate)], async function(req, res) {
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send('Invalid genre.');
  
    const movie = await Movie.findByIdAndUpdate(req.params.id,
      { 
        title: req.body.title,
        genre: {
          _id: genre._id,
          name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
      }, { new: true });
  
    if (!movie) return res.status(404).send('The movie with the given ID was not found.');
    
    res.send(movie);
});

router.delete('/:id', [auth, admin], async function(req, res) {
    const movie = await Movie.findByIdAndRemove(req.params.id);
    
    if(!movie) return res.status(404).send('The movie with the given ID was not found.');
    
    res.send(movie);
});

module.exports = router;