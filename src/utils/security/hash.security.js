import bcrypt from "bcryptjs";

export function hash({ plainText, saltRound }) {
  return bcrypt.hash(plainText, saltRound);
}

export function compareHash({ text='', cipherText='' }={}) {
  return bcrypt.compare(text, cipherText);
}
