import { WFM_TRANSFORM_DATA_FOR_CREATE_TASK } from './wfm_installation_check_task_of_staff_at_13_00.worker';
import { mockData } from './wfm_installation_check_task_of_staff_at_13_00.worker.mock';
import { mock } from 'jest-mock-extended';
import { TmsService } from '../../../services/tms/tms.service';

describe('WFM_TRANSFORM_DATA_FOR_CREATE_TASK', () => {
  const tmsService = mock<TmsService>();
  const worker = new WFM_TRANSFORM_DATA_FOR_CREATE_TASK(tmsService);

  describe('process', () => {
    test('success full day trip', async () => {
      tmsService.get.mockResolvedValue({ total: 0 });
      // @ts-ignore
      const result = await worker.process(mockData.input);

      expect(result).toEqual(mockData.expect);
    });
  });
});
