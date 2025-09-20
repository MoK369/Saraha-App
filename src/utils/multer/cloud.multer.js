import multer from "multer";
import fs from "fs/promises";
import path from "node:path";
import CustomError from "../custom/error_class.custom.js";

const cloudFileUpload = ({ validation = [], fileSize = 512 * 1024 } = {}) => {
  const storage = multer.diskStorage({
    destination: async function (req, file, callback) {
      await fs.access(path.resolve("./tmp")).catch(async (error) => {
        if (error.code == "ENOENT") {
          await fs.mkdir(path.resolve("./tmp"), { recursive: true });
        }
      }); // ensure that the /tmp folder exists
      callback(null, "./tmp"); // files will be uploaded to /tmp folder first before being uploaded to cloudinary
    },
    filename: function (req, file, callback) {
      callback(null, file.originalname);
    },
  });

  const fileFilter = function (req, file, callback) {
    if (validation.includes(file.mimetype)) {
      return callback(null, true);
    }

    return callback(new CustomError("Invalid image format"), false);
  };

  return multer({
    fileFilter,
    limits: {
      fileSize, // in bytes
    },
    storage,
  });
};

export default cloudFileUpload;
