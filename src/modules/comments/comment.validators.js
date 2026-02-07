const Joi = require("joi");

const createCommentSchema = Joi.object({
  text: Joi.string().min(1).max(300).required()
});

const updateCommentSchema = Joi.object({
  text: Joi.string().min(1).max(300).required()
});

module.exports = { createCommentSchema, updateCommentSchema };
