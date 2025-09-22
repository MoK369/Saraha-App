import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: function () {
        return this.attachments?.length ? false : true;
      },
      minLength: 3,
      maxLength: 200000,
    },
    attachments: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

messageSchema.methods.toJSON = function () {
  const {id,...restObj} = this.toObject();
  delete restObj._id;
  restObj.attachments = restObj.attachments?.map((img) => img.secure_url);
  return {id,...restObj};
}

const MessageModel = mongoose.model("Message", messageSchema);
MessageModel.syncIndexes();
export default MessageModel;
