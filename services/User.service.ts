import { Message, PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export class UserService {

  async getAll(): Promise<User[]> {
    return prisma.user.findMany();    
  }

  async getOne(username: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {username}
    });
  }

  async getOneById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {id}
    });
  }

  async create(username: string): Promise<User | null> {
    try {
      const user = await prisma.user.create({data: {username}});
      return user;
    } catch (error) {
      return null
    }
  }
}