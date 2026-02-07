const Joi = require("joi");

const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  bio: Joi.string().max(200).allow("").optional(),
  avatarUrl: Joi.string().uri().allow("").optional()
});

module.exports = { updateProfileSchema };
