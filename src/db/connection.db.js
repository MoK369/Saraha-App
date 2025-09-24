import mongoose from "mongoose";

async function checkDbConnection() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("DB Connected Successfully 👌");
    return true;
  } catch (error) {
    console.log("Failed to Connect to DB ⛔️");
    //console.log({ dbError: error });
    return false;
  }
}

export default checkDbConnection
