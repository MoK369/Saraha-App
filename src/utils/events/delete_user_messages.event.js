import { EventEmitter } from "node:events";
import DBService from "../../db/service.db.js";
import MessageModel from "../../db/models/message.model.js";

const userEvents = new EventEmitter();

userEvents.on("userHardDeleted", async (userId) => {
  await DBService.deleteMany({
    model: MessageModel,
    filter: { receiverId: userId },
  }).catch((error) => {
    console.error(`Failed to delete messages for user ${userId}`);
  });
});

export default userEvents;
