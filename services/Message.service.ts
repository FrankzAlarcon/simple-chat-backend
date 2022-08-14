import { GroupMessage, Message, PrismaClient, User } from '@prisma/client'
import { MessageToGroup, MessageToUser } from '../types';

const prisma = new PrismaClient();

export class MessageService {

  async getMessagesWithUser(senderId: string, receiverId: string){
    const data = await Promise.allSettled([prisma.message.findMany({
      where: {
        OR: [
          {
            userFromId: senderId,
            userToId: receiverId
          }, {
            userFromId: receiverId,
            userToId: senderId
          }
        ]
      },
      orderBy: {
        created_at: 'asc'
      }
    }), prisma.user.findFirst({where: {id: senderId}}), prisma.user.findFirst({where: {id: receiverId}})]);
    const values = data.map(item => {
      if(item.status === 'fulfilled') {
        return item.value;
      }
      return null;
    });
    const [messages, userFrom, userTo] = values;
    if(!messages || !userFrom || !userTo) {
      return null;
    }
    return {
      chats: messages as Message[] ?? [],
      userFrom: userFrom as User,
      userTo: userTo as User
    }
  }

  async getGroupMessages(groupId: string): Promise<{messages: GroupMessage[], name: string} | null> {
    return prisma.group.findFirst({
      where: {id: groupId},
      select: {
        messages: true,
        name: true,
      },
      orderBy: {
        created_at: 'asc'
      }     
    })
  }

  async sendMessageToUser(data: MessageToUser): Promise<Message> {
    const message = await prisma.message.create({data});
    return message;
  }

  async sendMessageToGroup(data: MessageToGroup): Promise<GroupMessage> {
    const message = await prisma.groupMessage.create({data});
    return message;
  }
}