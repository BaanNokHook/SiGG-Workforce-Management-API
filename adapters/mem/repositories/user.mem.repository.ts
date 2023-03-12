import { Service } from 'typedi';
import { IUserRepository } from '../../../libraries/authentication/type';
import { IUser } from '../../../repositories/user/user.repository';

let userList: IUser[] = [
  {
    _id: 'admin',
    firstname: 'name1',
    lastname: 'last1',
    roles: ['ADMIN']
  },
  {
    _id: 'user',
    firstname: 'name2',
    lastname: 'last2',
    roles: ['USER']
  },
  {
    _id: 'user1',
    firstname: 'name3',
    lastname: 'last3',
  },
]

@Service('IUserRepository')
export class UserMemoryRepository implements IUserRepository<IUser> {
  async getUserById(id: string): Promise<IUser | undefined> {
    return userList.find(u => u._id === id);
  }

}

