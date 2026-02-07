const Joi = require("joi");

const createPostSchema = Joi.object({
  text: Joi.string().min(1).max(500).required(),
  mediaUrls: Joi.array().items(Joi.string().uri()).max(5).optional()
});

const updatePostSchema = Joi.object({
  text: Joi.string().min(1).max(500).optional(),
  mediaUrls: Joi.array().items(Joi.string().uri()).max(5).optional()
});

module.exports = { createPostSchema, updatePostSchema };
