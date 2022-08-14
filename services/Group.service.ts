import {Group, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export class GroupService {
  async getUserGroups(userId: string): Promise<Group[]> {
    const userGroups = await prisma.userGroup.findMany({where: {userId}})
    const groupsIds = userGroups.map(userGroup => userGroup.groupId)
    const data = await Promise.allSettled(groupsIds.map(groupId => prisma.group.findFirst({where: {id: groupId}})))
    if(!data) {
      return [];
    }
    const groups = data.map(group => {
      if(group.status === 'fulfilled') {
        return group.value;
      }
      return null;
    })
    return groups.filter(group => group !== null) as Group[];
  }

  async create(name: string, users: string[]): Promise<Group> {
    const group = await prisma.group.create({data: {name}});
    await Promise.allSettled(users.map(userId => prisma.userGroup.create({data: {userId, groupId: group.id}})))
    return group;
  }
}