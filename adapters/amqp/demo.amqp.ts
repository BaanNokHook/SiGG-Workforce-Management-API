import { Service } from 'typedi';
import { amqpConsume } from '../../libraries/amqp/decorators/amqpConsumer';
import { amqpPublish } from '../../libraries/amqp/decorators/amqpPublisher';
import { InvalidMessage } from '../../libraries/amqp/errorType';
import { PublicationMessage, REJECT, REPUBLISH, SubscriptionMessage } from '../../libraries/amqp/type';
import { EchoService } from '../echo/echo.service';

@Service()
export class AmqpDemoService {
  constructor(private echoService: EchoService) { }

  // ***** tracing queue ********
  @amqpPublish('traced_queue')
  async sendTracedQueue(msg: any) {
    return msg;
  }

  @amqpConsume({ queueName: 'traced_queue' })
  async receiveTracedQueue(message: SubscriptionMessage) {
    if (message.error) {
      throw new Error(message.error);
    }

    await this.echoService.doEcho()
    await this.sendWorkQueue({ msg: 'hi workqueue' });
    console.log('receiveTracedQueue: ', message);
  }

  // ***** named queue ******** https://www.rabbitmq.com/tutorials/tutorial-one-python.html
  @amqpPublish('demo_named_queue')
  async sendNamedQueue(msg: any) {
    return msg;
  }

  @amqpConsume({ queueName: 'demo_named_queue' })
  async receiveNamedQueue(message: SubscriptionMessage) {
    console.log('receiveNamedQueue: ', message);
  }

  // ***** work queue ******** https://www.rabbitmq.com/tutorials/tutorial-two-python.html
  @amqpPublish({
    queue: 'demo_work_queue',
    options: { deliveryMode: 2 }
  })
  async sendWorkQueue(msg: any) {
    return msg;
  }

  @amqpConsume('demo_work_queue')
  async receiveWorkQueue1(message: SubscriptionMessage) {
    console.log('receiveWorkQueue1: ', message);
  }

  @amqpConsume('demo_work_queue')
  async receiveWorkQueue2(message: SubscriptionMessage) {
    console.log('receiveWorkQueue2: ', message);
  }

  // ***** pub/sub queue ******** https://www.rabbitmq.com/tutorials/tutorial-three-python.html
  @amqpPublish({
    exchange: 'pubsub_exch',
    exchangeConfig: { type: 'fanout' },
  })
  async sendPubsubQueue(msg: any) {
    return msg;
  }

  @amqpConsume({
    queueName: 'demo_pubsub_queue1',
    exchange: 'pubsub_exch',
    exchangeConfig: { type: 'fanout' }
  })
  async receivePubsubQueue1(message: SubscriptionMessage) {
    console.log('receivePubsubQueue1: ', message);
  }

  @amqpConsume({
    queueName: 'demo_pubsub_queue2',
    exchange: 'pubsub_exch',
    exchangeConfig: { type: 'fanout' }
  })
  async receivePubsubQueue2(message: SubscriptionMessage) {
    console.log('receivePubsubQueue2: ', message);
  }

  // ***** direct routing queue ******** https://www.rabbitmq.com/tutorials/tutorial-four-python.html
  @amqpPublish({
    exchange: 'routing_exch',
    exchangeConfig: { type: 'direct' },
  })
  async sendRoutingQueue(msg: any): Promise<PublicationMessage> {
    return msg;
  }

  @amqpConsume({
    queueName: 'demo_routing_queue_a',
    exchange: 'routing_exch',
    routingKey: 'a',
    exchangeConfig: { type: 'direct' },
  })
  async receiveRoutingQueueA(message: SubscriptionMessage) {
    console.log('receiveRoutingQueueA: ', message);
  }

  @amqpConsume({
    queueName: 'demo_routing_queue_b',
    exchange: 'routing_exch',
    routingKey: 'b',
    exchangeConfig: { type: 'direct' },
  })
  async receiveRoutingQueueB(message: SubscriptionMessage) {
    console.log('receiveRoutingQueueB: ', message);
  }

  // ***** topics queue ******** https://www.rabbitmq.com/tutorials/tutorial-five-python.html
  @amqpPublish({
    exchange: 'topics_exch',
  })
  async sendTopicQueue(msg: any): Promise<PublicationMessage> {
    return msg;
  }

  @amqpConsume({
    exchange: 'topics_exch',
    queueName: 'demo_topic.a',
    routingKey: 'a.*'
  })
  async receiveTopicQueueA(message: SubscriptionMessage) {
    console.log('receiveTopicQueueA: ', message);
  }

  @amqpConsume({
    exchange: 'topics_exch',
    queueName: 'demo_topic.a1',
    routingKey: 'a.1'
  })
  async receiveTopicQueueA1(message: SubscriptionMessage) {
    console.log('receiveTopicQueueA1: ', message);
  }

  @amqpConsume({
    exchange: 'topics_exch',
    queueName: 'demo_topic.b',
    routingKey: 'b'
  })
  async receiveTopicQueueB(message: SubscriptionMessage) {
    console.log('receiveTopicQueueB: ', message);
  }

  // ***** error handling: retry with delay using republish ********
  @amqpPublish({
    exchange: 'normal_exch', // default to type topic
    routingKey: 'republish_route',
  })
  async sendRepublishQueue(msg: any): Promise<PublicationMessage> {
    return msg;
  }

  @amqpConsume({
    exchange: 'normal_exch',
    queueName: 'republish_queue',
    routingKey: 'republish_route',
    options: {
      deadLetterExchange: 'default_dl'
    }
  }, {
    errorStrategy: { type: REPUBLISH, attempts: 10 } // this is a default
  })
  async receiveRepublishQueue(message: SubscriptionMessage) {
    console.log('receiveRepublishQueue: ', message);
    if (message.dl) {
      throw new Error('force error');
    }
  }

  // ***** error handling: when content is invalid ********
  @amqpConsume({
    exchange: 'normal_exch',
    queueName: 'a_queue',
    routingKey: 'a_route',
    options: {
      deadLetterExchange: 'default_dl'
    }
  })
  async receiveInvalidContentQueue(message: SubscriptionMessage) {
    console.log('receiveInvalidContentQueue: ', message);
    throw new InvalidMessage('message is invalid');
  }

  // ***** error handling: retry with delay using dead letter ********
  @amqpPublish({
    exchange: 'normal_exch', // default to type topic
    routingKey: 'route1'
  })
  async sendDLQueue(msg: any): Promise<PublicationMessage> {
    return msg;
  }

  @amqpConsume({
    exchange: 'deadletter_exch',
    queueName: 'deadletter_queue',
    options: {
      deadLetterExchange: 'normal_exch',
      messageTtl: 10000,
    },
    disabled: true
  })
  async receiveDLQueueDL(message: SubscriptionMessage) {
    console.log('receiveDLQueueDL: ', message);
  }

  errorCount = 0

  @amqpConsume({
    exchange: 'normal_exch',
    queueName: 'route1_queue',
    routingKey: 'route1',
    options: {
      deadLetterExchange: 'deadletter_exch',
    },
  }, {
    errorStrategy: { type: REJECT }
  })
  async receiveDLQueueNormal(message: SubscriptionMessage) {
    if (message.dl && this.errorCount === 0) {
      this.errorCount++;
      throw new Error('force error');
    }

    this.errorCount = 0;

    console.log('receiveDLQueueNormal: ', message);
  }

}