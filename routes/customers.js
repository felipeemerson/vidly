const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate_middleware = require('../middleware/validate');
const {Customer, validate} = require('../models/customer');

router.get('/', async function(req, res) {
    const customers = await Customer.find();
    res.send(customers);
});

router.get('/:id', async function(req, res) {
    const customer = await Customer.findById(req.params.id);

    if(!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});

router.post('/', [auth, validate_middleware(validate)], async function(req, res) {
    const customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    });

    await customer.save();
    res.send(customer);
});

router.put('/:id', [auth, validate_middleware(validate)], async function(req, res) {
    const customer = await Customer.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    }, { new: true });

    if(!customer) res.status(404).send("The customer with the given ID was not found.");

    res.send(customer);
});

router.delete('/:id', [auth, admin], async function(req, res) {
    const customer = await Customer.findByIdAndRemove(req.params.id).catch();
    if(!customer) return res.status(404).send("The customer with the given ID was not found.");

    res.send(customer);
});

module.exports = router;