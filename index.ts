import express from 'express';
import cors from 'cors';
import {createServer} from 'http';
import {Server} from 'socket.io';
import { ChatUser, GroupInfo, MessageToGroup, MessageToUser, UserInfo } from './types';
import { newUser } from './events/user';
import { newMessageToGroup, newMessageToUser } from './events/message';
import { newGroup } from './events/group';
import userRouter from './controllers/users.controller';
import groupRouter from './controllers/group.controller';
import { User } from '@prisma/client';

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT ?? 3001;

app.use(express.json())
app.use(cors());

app.use('/api/user-chat', userRouter);
app.use('/api/group-chat', groupRouter);

const server = app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
})

const io = new Server(server, {
  cors: {
    origin: '*',   
  }
});

export const socketsConnected: ChatUser[] = [];
export const usersConnected: UserInfo[] = [];

io.on('connection', (socket) => {
  console.log('User conected ' + socket.id); 
  socket.on('new user',async (username: string) => {
    try {
      const userConnected = await newUser(socket, username);
      if(!socketsConnected.some((socketConnected => socketConnected.username === username))) {
        socketsConnected.push({socketId: socket.id, username: userConnected.username});         
      }
      socket.emit('current user', userConnected, usersConnected.filter(user => user.username !== userConnected.username));
      socket.broadcast.emit('add user', usersConnected);
    } catch (error) {
      socket.emit('app error', error);
    }
  });

  socket.on('new message', async (data: MessageToUser) => { 
    const messageData = await newMessageToUser(socket, data);
    if(messageData) {    
      socket.emit('sended message', messageData.message);
      socket.to(messageData.socketReceiver).emit('send message', messageData.message);
    }
  });

  socket.on('add group', async (creator: User, groupInfo: GroupInfo) => {
    const {users} = groupInfo;
    const groupUsersId =  users.map(user => user.id);
    await newGroup(groupInfo.name, [creator.id, ...groupUsersId]);
    // Enviar a las rooms adecuadas
    const usernames = users.map(user => user.username);
    const usersOnline = socketsConnected.filter(user => usernames.includes(user.username));
    socket.emit('group created', groupInfo);
    usersOnline.forEach(user => {
      socket.to(user.socketId).emit('added to group', groupInfo);
    });
  });
  
  socket.on('enter to group', (groupId: string) => {
    socket.join(groupId);
  });

  socket.on('leave group', (groupId: string) => {
    socket.leave(groupId);
  })

  socket.on('group message', async (data: MessageToGroup) => {
    const message = await newMessageToGroup(socket, data);
    socket.emit('sended group message', message);
    socket.to(data.groupIdTo).emit('send group message', message);
  });

  socket.on('close session', () => {
    console.log('User disconnected ' + socket.id);
    const socketIndex = socketsConnected.findIndex(currentSocket => currentSocket.socketId === socket.id);
    const currentSocket = socketsConnected[socketIndex];
    if (socketIndex !== -1) {
      socketsConnected.splice(socketIndex, 1);
    }
    if(!currentSocket) return;
    const userIndex = usersConnected.findIndex(user => user.username === currentSocket.username);
    if (userIndex !== -1) {
      usersConnected.splice(userIndex, 1);
    }
    io.emit('remove user', usersConnected);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected ' + socket.id);
    const socketIndex = socketsConnected.findIndex(currentSocket => currentSocket.socketId === socket.id);
    const currentSocket = socketsConnected[socketIndex];
    if (socketIndex !== -1) {
      socketsConnected.splice(socketIndex, 1);
    }
    if(!currentSocket) return;
    const userIndex = usersConnected.findIndex(user => user.username === currentSocket.username);
    if (userIndex !== -1) {
      usersConnected.splice(userIndex, 1);
    }
    io.emit('remove user', usersConnected);
  });
})

// httpServer.listen(PORT, () => {
//   console.log('Server running on port ' + PORT);
// });

