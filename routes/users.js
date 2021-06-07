const express = require('express');
const router = express.Router();
const { User, validate } = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const validate_middleware = require('../middleware/validate');


router.get('/me', auth, async function(req, res){
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.post('/', validate_middleware(validate), async function(req, res){
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered.");

    user = new User(_.pick(req.body, ['name', 'email', 'password']));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const token = user.generateAuthToken();

    //header para retornar token e o usuário já ficar logado quando criar conta
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

module.exports = router;