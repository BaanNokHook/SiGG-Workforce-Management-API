import { CfmService } from './cfm.service';

describe('CfmService', () => {
  const cfmEndpoint = 'http://pilotx.truecorp.co.th/sendITset3';
  const cfmService = new CfmService(cfmEndpoint);

  test('update technicianTask', async () => {
    try {
      await cfmService.updateTechnicianInTask('test_order_no', 'staff_1');
    } catch (err) {
      expect(err.toString()).toBe(
        `Internal Error: unable updateTechnicianInTask by taskOrderNo, staffCode and cause (test_order_no , staff_1, The TASK_ORDER_NO: test_order_no not exists.)`,
      );
    }
  });
});
