import CryptoJS from "crypto-js";

export function encryptText({ text, secretKey }) {
  return CryptoJS.AES.encrypt(text, secretKey);
}

export function decryptText({ ciphertext, secretKey }) {
  return CryptoJS.AES.decrypt(ciphertext, secretKey);
}
