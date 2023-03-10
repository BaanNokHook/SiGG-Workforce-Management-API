import Koa from 'koa'
import { RoutingControllersOptions, useContainer, useKoaServer } from 'routing-controllers'
import Container from 'typedi';
import { getApiDocRoutes } from '../apidoc/routes'

export default function useRoutingController(app: Koa) {
  // its important to set container before any operation you do with routing-controllers,
  // including importing controllers
  useContainer(Container);

  const routerControllerOPtions: RoutingControllersOptions = {  
      defaultErrorHandler: false,  
      controllers: [__dirname + '/../controllers/**/(!)*.test.*)'],  // load any files excluding test files  
  }

  // apidocs endpoints (must be after useKoaServer)
  app.use(getApiDocRoutes({
      title: 'Fleet of driver, technician and vehicle',  
      version: '',  

  }, routerControllerOPtions))   
}