import * as mongoose from 'mongoose';
import { IHealthCheck } from '../../libraries/health/interface';

export class MongoHealthCheck implements IHealthCheck {
  getName() {
    return 'mongoose';
  }

  async getHealth() {
    const readyState = mongoose.connection.readyState

    return {
      ok: readyState === 1,
      status: mongoose.connection.states[readyState]
    }
  }

}