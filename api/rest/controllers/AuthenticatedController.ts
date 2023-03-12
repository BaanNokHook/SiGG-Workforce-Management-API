import { Controller, CurrentUser, Get } from 'routing-controllers';
import { IUser } from '../../../repositories/user/user.repository';

@Controller('/v1/authenticated')
export class AuthenticatedController {

  @Get('/user')
  getUser(@CurrentUser() user?: IUser) {
    return { user };
  }

  @Get('/must')
  getUserOrDie(@CurrentUser({ required: true }) user: IUser) {
    return { user };
  }

}
