import { Socket } from 'socket.io';
import { usersConnected } from '..';
import { GroupService } from '../services/Group.service';
import { UserService } from '../services/User.service';

export const userService = new UserService();
export const groupService = new GroupService();

export const newUser = async (socket: Socket, username: string) => {    
  console.log('User ' + username + ' conected ' + socket.id);
  const user = await userService.getOne(username);
  if(!user) {
    const newUser = await userService.create(username);
    if(!newUser) {
      throw new Error('Ya existe un usuario con ese nombre');
    }
    const groups = await groupService.getUserGroups(newUser.id);
    usersConnected.push({...newUser, groups}); 
    return newUser;
  }
  const groups = await groupService.getUserGroups(user.id);
  const completeUser = {...user, groups}
  if(!usersConnected.some(userConnected => userConnected.username === user.username)) {
    usersConnected.push(completeUser);
  }
  return completeUser;
}