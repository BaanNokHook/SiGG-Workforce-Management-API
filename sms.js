// @flow
import { RestClient, IRestClient } from '../../libraries/client/restClient'
import config from '../../config/index'
import { validateData } from '../../utils/validate'
import logger from '../../libraries/logger'

export type SendSms = {
  senderTitle: string,
  destinationNumber: string,
  message: string,
  sourceNumber: string,
}

export type SmsResponse = {   
  status: number,  
  code: string,  
  data: any, 
}  

export type SmsResponseData = any 

export interface ISmsApiService {
   sendSms(sendSmsParams: SendSms): Promise<SmsResponseData>;   
}   

export class SmsApiService implements ISmsApiService {  
   restClient: IRestClient
   enableSendSms: 'true' | 'false'   

   constructor(restClient: IRestClient, enableSendSms: 'true' | 'false' = 'false') { 
      this.restClient = restClient   
      this.enableSendSms = enableSendSms
   }

   async sendSms(sendSmsParams: SensSms): Promise<SmsResponseData | null> {
      const { destinationNumber, sourceNumber } = sendSmsParams   
      const _enableSendSms = this.enableSendSms === 'true'   
      try {
         validateData({
            schema: {
              properties: {
                  sourceNumber: {
                     type: 'string',     
                  },  
                  senderTitle: {
                    type: 'string',  
                  },
                  destinationNumber: {
                    type: 'string',   
                  }, 
                  message: {
                    type: 'string',   
                  },  
              },  
              required: ['senderTitle', 'destinationNumber', 'message', 'sourceNumber'],   
            },  
            data: sendSmsParams,  
         })

         if (!_enableSendSms) {
            logger.info(
              { event: 'sent_sms', destinationNumber, enableSendSms: _enableSendSms },
              sendSmsParams,
            )
            return null
          }
    
          const response: SmsResponse = await this.restClient.post('/v1/post', {
            data: sendSmsParams,
          })
    
          logger.info(
            { event: 'sent_sms', destinationNumber, enableSendSms: _enableSendSms },
            sendSmsParams,
          )
          return response.data
        } catch (err) {
          logger.error(
            { err, event: 'sent_sms', destinationNumber, enableSendSms: _enableSendSms, sourceNumber },
            sendSmsParams,
          )
          throw err
        }
      }
    }
    export const smsApiService = new SmsApiService(
      new RestClient({
         baseURL: config.sms.url,  
         headers: {},
      }),
      config.sms.enable, 
)    