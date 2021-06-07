const express = require('express');
const router = express.Router();
const { equal } = require('joi');
const Joi = require('joi');   
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const validate_middleware = require('../middleware/validate');

router.post('/', validate_middleware(validate), async function(req, res){
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid email or password");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send("Invalid email or password");

    const token = user.generateAuthToken();
    res.send(token);
});

function validate(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).email().required(),
        password: Joi.string().min(5).max(255).required()
    });
    return schema.validate(req);
}

module.exports = router;