import { Authorized, Controller, Get } from 'routing-controllers';

@Controller('/v1/authorize')
export class AuthenticatedController {

  @Authorized()
  @Get('/authen')
  getAuthenticated() {
    return { authen: true };
  }

  @Authorized('ADMIN')
  @Get('/admin')
  getRole() {
    return { admin: true };
  }

  @Authorized(['ADMIN', 'USER'])
  @Get('/userOrAdmin')
  getRoles() {
    return { userOrAdmin: true };
  }

  @Authorized({ scope: 'read', resource: 'rsc1' })
  @Get('/readpermission')
  getPermission() {
    return { readpermission: true };
  }

  @Authorized({ resource: 'rsc1' })
  @Get('/anyscope')
  getAdminPermission() {
    return { anyscope: true };
  }

}
