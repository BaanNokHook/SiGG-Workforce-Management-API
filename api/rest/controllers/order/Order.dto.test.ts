import { validate } from 'class-validator';
import { OrderRequestDto } from './Order.dto';

describe('Order DTO', () => {
  test('should required ticket', async () => {
    const orderDto = new OrderRequestDto();
    orderDto.ticket = {} as any;

    const errors = await validate(orderDto, {
      skipMissingProperties: true,
      validationError: { target: false },
    });

    expect(errors.length).toEqual(1);
    expect(errors[0].target).toBeUndefined();
    expect(errors[0].property).toEqual('ticket');
    expect(errors[0].constraints).toEqual({
      isNotEmptyObject: 'ticket must be a non-empty object',
    });
    expect(errors[0].value).toEqual({});
  });
});
