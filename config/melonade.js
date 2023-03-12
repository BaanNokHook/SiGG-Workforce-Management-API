import 'dotenv/config'
import { IAdminConfig } from '@melonade/melonade-client'

export const MelonadeConfig: IAdminConfig = {
  kafkaServers: process.env.MELONADE_KAFKA_BROKERS,
  namespace: process.env.MELONADE_NAMESPACE,
}
