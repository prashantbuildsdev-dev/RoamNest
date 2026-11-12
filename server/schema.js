const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    title: Joi.string().trim().min(1).required(),
    description: Joi.string().trim().min(1).required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().trim().required(),
    country: Joi.string().trim().required()
});

module.exports.reviewSchema = Joi.object({
    comment: Joi.string().trim().required(),
    rating: Joi.number().integer().min(1).max(5).required()
});