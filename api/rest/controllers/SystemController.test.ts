import { mock, mockReset } from 'jest-mock-extended';
import { Healthchecker } from '../../../libraries/health/healthchecker';
import { HealthController } from "./SystemController";

describe('SystemController.test', () => {
  const mockHealthchecker = mock<Healthchecker>();
  const controller = new HealthController(mockHealthchecker);

  beforeEach(() => {
    mockReset(mockHealthchecker);
  })

  describe('Normal cases', () => {

    it('should be healthy', async () => {
      mockHealthchecker.check.mockResolvedValue({ ok: true });

      let mockCtx = { status: 200 } as any;
      const result = await controller.health(mockCtx)

      expect(result).toMatchObject({ ok: true });
      expect(mockCtx.status).toBe(200);
    })

    it('should be unhealthy', async () => {
      mockHealthchecker.check.mockResolvedValue({ ok: false });

      let mockCtx = { status: 200 } as any;
      const result = await controller.health(mockCtx)

      expect(result).toMatchObject({ ok: false });
      expect(mockCtx.status).toBe(503);
    })

  })

})