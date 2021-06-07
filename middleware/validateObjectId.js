const mongoose = require('mongoose');

module.exports = function (req, res, next) {
    const isInvalidId = !mongoose.Types.ObjectId.isValid(req.params.id);
    if(isInvalidId) return res.status(404).send("Invalid ID");

    next();
}