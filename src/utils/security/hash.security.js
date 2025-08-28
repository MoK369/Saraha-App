import bcrypt from "bcryptjs";

export function hash({ text, saltRound }) {
  return bcrypt.hashSync(text, saltRound);
}

export function compareHash({ text, hashedText }) {
  return bcrypt.compare(text, hashedText);
}
