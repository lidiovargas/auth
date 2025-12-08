import bcrypt from 'bcrypt';

export class Password {
  static async toHash(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  static async compare(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}
