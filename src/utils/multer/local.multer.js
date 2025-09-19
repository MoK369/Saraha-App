import multer from "multer";
import fs from "fs/promises";
import path from "node:path";
import CustomError from "../custom/error_class.custom.js";

const localFileUpload = ({ customPath = "general", validation = [], fileSize = 512 * 1024 } = {}) => {
  /* 
    Not to put this === let basePath = `uploads/${customPath}`; === here because:
    Since localFileUpload() is called once during setup, 
    the basePath variable is shared across all requests that use this middleware.
    When you modify basePath inside the destination function (e.g., basePath += ...), you're mutating the same variable for every request, 
    which can lead to unexpected behavior.
     */
  const storage = multer.diskStorage({
    destination: async function (req, file, callback) {
      let basePath = `uploads/${customPath}`;
      if (req.user?.id) {
        basePath += `/${req.user.id}`;
      }
      console.log({ basePathAfter: basePath });

      const fullPath = path.resolve(`./src/${basePath}`);
      console.log({ fullPath });

      await fs.access(fullPath).catch(async (error) => {
        if (error.code == "ENOENT") {
          await fs.mkdir(path.resolve(fullPath), { recursive: true });
        }
      });
      file.basePath = basePath;
      callback(null, fullPath);
    },
    filename: function (req, file, callback) {
      console.log({ file });

      const uniqueFileName =
        `${Date.now()}` +
        Math.ceil(Math.random() * 1000000000000) +
        "_" +
        file.originalname;
      file.finalPath = `${file.basePath}/${uniqueFileName}`;
      callback(null, uniqueFileName);
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

export default localFileUpload;
