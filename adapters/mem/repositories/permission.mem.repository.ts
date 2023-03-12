import { Service } from 'typedi';
import { IPermission, IPermissionRepository } from '../../../libraries/authorization/type';
import { IUser } from '../../../repositories/user/user.repository';

let readPermissions: IPermission[] = [
  {
    scope: 'read',
    resource: 'rsc1'
  },
]

let adminPermissions: IPermission[] = [
  {
    scope: '*',
    resource: '*'
  },
]

const userPermissions: { [key: string]: IPermission[] } = {
  'admin': adminPermissions,
  'user': readPermissions
}

@Service('IPermissionRepository')
export class PermissionRepository implements IPermissionRepository<IUser> {
  async getPermissions(user: IUser): Promise<IPermission[] | undefined> {
    return userPermissions[user._id];
  }
}

