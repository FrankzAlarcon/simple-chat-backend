export interface ChatUser {
  socketId: string,
  username: string
}

export interface User {
  id: string,
  username: string
}

export interface UserInfo extends User {
  groups: Group[]
}

export interface GroupInfo {
  id: string,
  name: string
  users: User[]
}

export type Group = Omit<GroupInfo, 'users'>;

export interface MessageToUser {
  userFromId: string,
  userToId: string,
  text: string
}

export interface MessageToGroup {
  userIdFrom: string,
  groupIdTo: string,
  text: string
}