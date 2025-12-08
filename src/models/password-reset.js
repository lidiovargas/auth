// A TTL collection on Mongo

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const PasswordResetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900, // 900 seconds = 15 minutes
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const PasswordResetToken = mongoose.model(
  'password-reset',
  PasswordResetSchema
);

export { PasswordResetToken, PasswordResetSchema };
