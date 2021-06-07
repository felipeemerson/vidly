const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const validate_middleware = require('../middleware/validate');
const  { Genre, validate } = require('../models/genre');

router.get('/', async function(req, res, next) {
    const genres = await Genre
    .find()
    .sort('name')
    .select({ name: 1 });
    res.send(genres);
});

router.get('/:id', validateObjectId, async function(req, res) {
    const genre = await Genre.findById(req.params.id);

    if(!genre) return res.status(404).send("The genre with the given ID was not found.");
    
    res.send(genre);
});

router.post('/', [auth, validate_middleware(validate)], async function(req, res) {
    const genre = new Genre({ name: req.body.name });

    await genre.save();
    res.send(genre);
});

router.put('/:id', [validateObjectId, auth, validate_middleware(validate)], async function(req, res) {
    const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, { 
        new: true
    });

    if(!genre) res.status(404).send("The genre with the given ID was not found.");
    res.send(genre);
});

router.delete('/:id', validateObjectId, [auth, admin], async function(req, res) {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if(!genre) return res.status(404).send("The genre with the given ID was not found.");

    res.send(genre);
});

module.exports = router;