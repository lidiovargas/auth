import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, unique: true },
    additionalName: [String],
    email: {
      type: String,
      // email unique if exists, but the field can be null
      sparse: true,
      unique: true,
    },
    birthDate: String,
    gender: String,
    password: String,
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    collation: { locale: 'pt', strength: 1 },
  }
);

const User = mongoose.model('user', UserSchema);

export { User, UserSchema };
