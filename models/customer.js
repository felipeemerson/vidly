const mongoose = require('mongoose');
const { equal } = require('joi');
const Joi = require('joi');

const Customer = mongoose.model('Customer', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 100
    },
    isGold: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        required: true,
        match: /^([0-9]{9}|[0-9]{8})$/
    }
}));

function validateCustomer(customer) {
    const schema = Joi.object({
        name: Joi.string().min(10).max(100).required(),
        phone: Joi.string().regex(/^([0-9]{9}|[0-9]{8})$/).required(),
        isGold: Joi.boolean()
    });

    return schema.validate(customer);
}

exports.Customer = Customer;
exports.validate = validateCustomer;