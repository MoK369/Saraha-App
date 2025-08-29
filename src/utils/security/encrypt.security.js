import CryptoJS from "crypto-js";

export function encryptText({ plainText, secretKey }) {
  return CryptoJS.AES.encrypt(plainText, secretKey).toString();
}

export function decryptText({ ciphertext, secretKey }) {
  return CryptoJS.AES.decrypt(ciphertext, secretKey).toString(
    CryptoJS.enc.Utf8
  );
}
