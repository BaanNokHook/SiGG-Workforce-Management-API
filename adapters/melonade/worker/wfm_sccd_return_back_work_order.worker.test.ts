import { ITask } from '@melonade/melonade-client';
import { mock, mockReset } from 'jest-mock-extended';
import mockdate from 'mockdate';
import { SccdResultCode } from '../../../services/sccd/interface';
import { SccdService } from '../../../services/sccd/sccd.service';
import { TmsService } from '../../../services/tms/tms.service';
import { WFM_SCCD_RETURN_BACK_WORK_ORDER_WORKER } from './wfm_sccd_return_back_work_order.worker';

const mockRequest = {
  requestId: 'requestId',
  approver: 'approver',
  requestedBy: 'requestedBy',
  requestTypeId: 'requestTypeId',
  status: 'APPROVED',
  metadata: {
    task: {
      _id: 'task_id',
    },
    reason: {
      item: {
        code: 'reason_code',
        name: 'reason_name',
      },
    },
  },
};

const mockSccdTask = {
  information: {
    userId: 'userId',
    userName: 'userName',
    systemId: 'systemId',
    woList: [
      {
        workorderNo: 'workorderNo',
      },
    ],
  },
};

describe('WFM_SCCD_RETURN_BACK_WORK_ORDER_WORKER', () => {
  const tmsService = mock<TmsService>();
  const sccdService = mock<SccdService>();

  beforeEach(() => {
    mockReset(tmsService);
    mockReset(sccdService);
    mockdate.reset();
  });

  afterAll(() => {
    mockdate.reset();
    jest.clearAllMocks();
  });

  const worker = new WFM_SCCD_RETURN_BACK_WORK_ORDER_WORKER(
    tmsService,
    sccdService,
  );

  describe('process', () => {
    it('should process completed', async () => {
      mockdate.set('2021-01-01T00:00:00.000Z');
      let task: ITask = {} as any;
      task.input = {
        request: mockRequest,
      };

      tmsService.getTaskById.mockResolvedValueOnce({
        data: mockSccdTask,
      } as any);

      sccdService.returnBackWorkOrder.mockResolvedValueOnce({
        resultCode: SccdResultCode.E00,
      });

      const result = await worker.process(task);
      expect(result).toEqual({
        status: 'COMPLETED',
        output: {
          isSuccess: true,
          payload: {
            operDate: '2021-01-01 07:00:00',
            reason: 'reason_name',
            remark: '-',
            systemId: 'systemId',
            userId: 'userId',
            userName: 'userName',
            workorderNo: 'workorderNo',
          },
          response: {
            resultCode: SccdResultCode.E00,
          },
        },
      });
      expect(tmsService.getTaskById).toBeCalledWith('task_id');
      expect(sccdService.returnBackWorkOrder).toBeCalledWith({
        operDate: '2021-01-01 07:00:00',
        reason: 'reason_name',
        remark: '-',
        systemId: 'systemId',
        userId: 'userId',
        userName: 'userName',
        workorderNo: 'workorderNo',
      });
    });
  });

  describe('compensate', () => {
    it('should compensate success', async () => {
      let task: ITask = {
        transactionId: 'transactionId',
        input: {
          output: {
            isSuccess: true,
          },
        },
      } as any;

      const result = await worker.compensate(task);
      expect(result).toEqual({
        status: 'COMPLETED',
        output: {
          transactionId: 'transactionId',
          input: {
            output: {
              isSuccess: true,
            },
          },
        },
      });
    });
  });
});
