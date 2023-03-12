import { mock, mockReset } from 'jest-mock-extended';
import { IRouterContext } from 'koa-router';
import {
  ISyncStaffResponse,
  STAFF_ROLE,
  STAFF_STATUS,
} from '../../../../domains/installation/interface';
import { SyncStaffDomain } from '../../../../domains/installation/syncStaff.domain';
import { UpdateStaffRequestDto } from './SyncStaff.dto';
import { SyncStaffController } from './SyncStaffController';

jest.mock('../../../../bootstrapRestApi', () => {
  return {
    enableTracing: jest.fn(),
  };
});

describe('SyncStaffController', () => {
  const syncStaffDomainMock = mock<SyncStaffDomain>();
  const controller = new SyncStaffController(syncStaffDomainMock);
  const mockUpdateResponse: ISyncStaffResponse = {
    message: 'success',
    data: {
      transactionId: '230bec20-3b39-11ea-9dd9-77f3afdef1d5',
      staffCode: '10060014',
    },
  };

  beforeEach(() => {
    mockReset(syncStaffDomainMock);
  });

  test('should update staff successfully', async () => {
    syncStaffDomainMock.updateStaffInfo.mockResolvedValue(mockUpdateResponse);
    const mockCtx = {} as IRouterContext;
    const mockRequest: UpdateStaffRequestDto = {
      teamId: 'TEAM-XXX',
      staffCode: '10060014',
      staffName: 'Hello',
      phone: '0812345678',
      email: 'test@example.com',
      role: STAFF_ROLE.TECHNICIAN,
      status: STAFF_STATUS.ACTIVE,
      defaultLocation: {
        lat: 13.7456058,
        long: 100.5341187,
      },
    };
    const response = await controller.updateStaffInfo(mockCtx, mockRequest);

    expect(mockCtx.status).toEqual(200);
    expect(response.data.staffCode).toEqual(mockUpdateResponse.data.staffCode);
  });
});
