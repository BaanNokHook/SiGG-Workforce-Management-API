import * as koaCors from '@koa/cors';
import * as koa from 'koa';
import * as koaBodyParser from 'koa-bodyparser';
import * as koaCompress from 'koa-compress';
import { Action, RoutingControllersOptions, useContainer, useKoaServer } from 'routing-controllers';
import { Container } from "typedi";
import { AuthenticationProvider } from '../../libraries/authentication/authenticationProvider';
import { buildAuthorizationRequest } from '../../libraries/authorization/authRequest';
import { IAuthorizationProvider } from '../../libraries/authorization/type';
import { ILogger } from '../../libraries/logger/logger.interface';
import { gracefulShutdown } from '../../libraries/shutdown/gracefulShutdown';
import { consoleLogger } from '../../logger';
import { IUser } from '../../repositories/user/user.repository';
import { getApiDocRoutes } from './apidoc/routes';
import { errorHandler } from './middlewares/errorHandler';
import { loggingMiddleware } from './middlewares/logging';
import { pathNotFoundHandler } from './middlewares/pathNotFoundHandler';
import { requestIdMiddleware } from './middlewares/requestId';

useContainer(Container);

export interface IRestApiServer {
  port?: number
  hostname?: string
  autoStart?: boolean
  appName?: string
  appDescription?: string
  appVersion?: string
  logger?: ILogger
  authenticationProvider?: AuthenticationProvider<IUser>,
  authorizationProvider?: IAuthorizationProvider<IUser>
}

export class RestApiServer {
  private app: koa;
  private port: number;
  private hostname: string
  private logger: ILogger

  constructor(private options: IRestApiServer = {}) {
    this.hostname = options.hostname || '0.0.0.0';
    this.port = options.port || 8080;
    this.logger = options.logger || consoleLogger

    this.app = new koa();

    this.app.use(koaCors());
    this.app.use(koaBodyParser());
    this.app.use(koaCompress());
    this.app.use(requestIdMiddleware());
    this.app.use(errorHandler);
    this.app.use(loggingMiddleware({ logger: this.logger }));

    const routerControllerOptions: RoutingControllersOptions = {
      defaultErrorHandler: false,
      controllers: [__dirname + '/controllers/**/!(*.test.*)'], // load any files excluding test files
      currentUserChecker: async (action: Action) => {
        const user = await this.getUser(action.context);
        action.context.user = user;
        return user;
      },
      authorizationChecker: async (action: Action, data: any) => {

        // default to unauthorize if @Authorized is used
        if (!this.options.authorizationProvider) return false;

        const authRequest = buildAuthorizationRequest<IUser>(data);

        const user = await this.getUser(action.context);
        action.context.user = user;

        authRequest.user = user;

        return this.options.authorizationProvider.isAuthorized(authRequest);
      }
    }

    // business logic endpoints
    useKoaServer(this.app, routerControllerOptions)

    // apidoc endpoints (must be after useKoaServer)
    const { appName, appDescription, appVersion } = this.options

    this.app.use(getApiDocRoutes({
      title: appName || 'API Document',
      description: appDescription,
      version: appVersion || '',

    }, routerControllerOptions))

    this.app.use(pathNotFoundHandler)
  }

  private async getUser(ctx: koa.Context) {
    if (ctx.user) {
      return ctx.user as IUser;
    }

    return this.options.authenticationProvider?.getUserFromCtx(ctx)
  }

  start = () => {
    const server = this.app.listen(this.port, this.hostname, () =>
      this.logger.info({ event: 'server_started' }, `Server listen at http://${this.hostname}:${this.port}`),
    );

    gracefulShutdown(this.logger, 'http', (done) => {
      server.close(done);
    });

  };
}
