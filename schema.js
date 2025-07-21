const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().uri().allow("",null),
        price: Joi.number().required().min,
        location: Joi.string().required(),
        country: Joi.string().required(),
    }).required(),
});