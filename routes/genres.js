const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const asyncMiddleware = require('../middleware/async');
const  { Genre, validate } = require('../models/genre');

router.get('/', asyncMiddleware(async function(req, res, next) {
    const genres = await Genre
    .find()
    .sort('name')
    .select({ name: 1 });
    res.send(genres);
}));

router.get('/:id', asyncMiddleware(async function(req, res) {
    const genre = await Genre.findById(req.params.id);
    if(!genre) return res.status(404).send("The genre with the given ID was not found.");
    res.send(genre);
}));

router.post('/', auth, asyncMiddleware(async function(req, res) {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const genre = new Genre({ name: req.body.name });

    await genre.save();
    res.send(genre);
}));

router.put('/:id', auth, asyncMiddleware(async function(req, res) {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, { 
        new: true
    });

    if(!genre) res.status(404).send("The genre with the given ID was not found.");
    res.send(genre);
}));

router.delete('/:id', [auth, admin], asyncMiddleware(async function(req, res) {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if(!genre) return res.status(404).send("The genre with the given ID was not found.");

    res.send(genre);
}));

module.exports = router;