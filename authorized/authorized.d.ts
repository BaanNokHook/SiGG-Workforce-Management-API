import 'routing-controllers';
import { IAuthorizationOption } from '../libraries/authorization/type';

declare module 'routing-controllers' {
  export function Authorized(): Function;
  export function Authorized(role: string): Function;
  export function Authorized(roles: string[]): Function;
  export function Authorized(options: IAuthorizationOption): Function;
}