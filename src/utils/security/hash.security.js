import bcrypt from "bcryptjs";

export function hash({ plainText, saltRound = parseInt(process.env.SALT_ROUND) }={}) {    
  return bcrypt.hash(plainText, saltRound);
}

export function compareHash({ text = "", cipherText = "" } = {}) {
  return bcrypt.compare(text, cipherText);
}
