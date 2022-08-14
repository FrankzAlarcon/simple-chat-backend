import { GroupService } from "../services/Group.service";

const groupService = new GroupService();

export const newGroup = async (name: string, users: string[]) => {
  const group = await groupService.create(name, users);  
  return group;
}