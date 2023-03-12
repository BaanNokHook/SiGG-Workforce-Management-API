import { Body, Controller, Post, UseBefore } from 'routing-controllers';
import { AmqpDemoService } from '../../../adapters/amqp/demo.amqp';
import { enableTracing } from '../../../bootstrapRestApi';

@Controller('/amqp')
export class AmqpController {
  constructor(private amqpDemo: AmqpDemoService) {}

  @Post('/named_queue')
  sendNamedQueue(@Body() body: any) {
    this.amqpDemo.sendNamedQueue(body);

    return 'ok';
  }

  @Post('/work_queue')
  sendWorkQueue(@Body() body: any) {
    this.amqpDemo.sendWorkQueue(body);

    return 'ok';
  }

  @Post('/pubsub')
  sendPubsub(@Body() body: any) {
    this.amqpDemo.sendPubsubQueue(body);

    return 'ok';
  }

  @Post('/route')
  sendRoute(@Body() body: any) {
    this.amqpDemo.sendRoutingQueue(body);

    return 'ok';
  }

  @Post('/topic')
  sendTopic(@Body() body: any) {
    this.amqpDemo.sendTopicQueue(body);

    return 'ok';
  }

  @Post('/dl')
  sendDeadLetter(@Body() body: any) {
    this.amqpDemo.sendDLQueue(body);

    return 'ok';
  }

  @Post('/republish')
  sendRepublish(@Body() body: any) {
    this.amqpDemo.sendRepublishQueue(body);

    return 'ok';
  }

  @Post('/trace')
  @UseBefore(enableTracing)
  sendTrace(@Body() body: any) {
    this.amqpDemo.sendTracedQueue(body);

    return 'ok';
  }
}
