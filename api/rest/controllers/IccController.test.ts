import { mock, mockReset } from 'jest-mock-extended';
import { IccDomain } from '../../../domains/icc/icc.domain';
import { expectedDecoderMock } from '../../../services/tvsApi/tvs.mock';
import { IccController } from './IccController';

describe('IccController', () => {
  const IccDomainMock = mock<IccDomain>();
  const IccControllerMock = new IccController(IccDomainMock);

  beforeEach(() => {
    mockReset(IccDomainMock);
  });

  describe('getDecoder', () => {
    test('should get Decoder list successfully, and return data equal expected', async () => {
      IccDomainMock.getDecoders.mockResolvedValue(expectedDecoderMock);
      const tvsCustomerNoMock: string = 'tvsCustomerNoMock';
      const result = await IccControllerMock.getDecoder(tvsCustomerNoMock);
      expect(result).toEqual({
        statusCode: 200,
        status: 'success',
        data: expectedDecoderMock,
      });
    });
  });
});
