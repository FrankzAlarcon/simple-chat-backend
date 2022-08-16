import { Socket } from "socket.io";
import { socketsConnected } from "..";
import { MessageService } from "../services/Message.service";
import { MessageToGroup, MessageToUser } from "../types";
import { userService } from "./user";

const messageService = new MessageService();

export const newMessageToUser = async (socket: Socket, data: MessageToUser) => {
  const receiver = await userService.getOneById(data.userToId);
  if(!receiver) {
    return
  }
  const receiverSocketId = socketsConnected.find((user => user.username === receiver.username));
  if(!receiverSocketId) return;
  const message = await messageService.sendMessageToUser(data);  
  return {
    socketReceiver: receiverSocketId.socketId,
    message
  }
}

export const newMessageToGroup = async (socket: Socket, data: MessageToGroup) => {  
  const message = await messageService.sendMessageToGroup(data);
  return message;
}