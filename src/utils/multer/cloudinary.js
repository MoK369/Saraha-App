import { v2 as cloudinary } from "cloudinary";

export const cloudinaryCloud = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
};

export const cloudinaryUploadFile = async ({
  file = {},
  path = "general",
} = {}) => {
  return cloudinaryCloud().uploader.upload(file.path, {
    folder: `${process.env.APP_NAME}/${path}`,
  });
};

export const cloudinaryUploadFiles = async ({
  files = [],
  path = "general",
} = {}) => {
  const attachments = [];
  for (const file of files) {
    const { secure_url, public_id } = await cloudinaryUploadFile({
      file,
      path,
    });
    attachments.push({ secure_url, public_id });
  }
  return attachments;
};

export const cloudinaryDeleteFile = async ({ public_id = "" } = {}) => {
  return cloudinaryCloud().uploader.destroy(public_id);
};

export const cloudinaryDeleteFiles = async ({
  public_ids = [],
  options = { type: "upload", resource_type: "image" },
} = {}) => {
  return cloudinaryCloud().api.delete_resources(public_ids, options);
};

export const cloudinaryDeleteFolder = async ({ path = "" } = {}) => {
  await cloudinaryCloud().api.delete_resources_by_prefix(`${process.env.APP_NAME}/${path}`,);
  await cloudinaryCloud().api.delete_folder(`${process.env.APP_NAME}/${path}/coverImages`);
  return cloudinaryCloud().api.delete_folder(`${process.env.APP_NAME}/${path}`);
}