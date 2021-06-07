const { equal } = require('joi');
const Joi = require('joi');

module.exports = function() {
    Joi.objectId = require('joi-objectid')(Joi);
}