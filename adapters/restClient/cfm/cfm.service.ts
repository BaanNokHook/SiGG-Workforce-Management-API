import * as R from 'ramda';
import { Inject, Service } from 'typedi';
import * as parser from 'xml2json';
import { InternalError } from '../../../errors/errors';
import { RestClient } from '../../../libraries/client/restClient';
import { ILogger } from '../../../libraries/logger/logger.interface';
import { consoleLogger } from '../../../logger';
import {
  IUpdateCallLogRequest,
  IUpdateCallLogResponse,
  IUpdateTechnicianInTaskResponse,
  STATUS_CODE,
} from './interface';

@Service('CfmService')
export class CfmService {
  private client: RestClient;

  constructor(
    @Inject('config.zsmart_api.ZSMART_URL') baseURL: string,
    @Inject('logger') private logger: ILogger = consoleLogger,
  ) {
    this.client = new RestClient({
      baseURL,
    });
  }

  async updateTechnicianInTask(
    taskOrderNo: string,
    staffCode: string,
  ): Promise<IUpdateTechnicianInTaskResponse | null> {
    const body: string = `
    <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
        <Body>
            <updateTechnician xmlns="http://oss.zsmart.ztesoft.com/wfm/webservice/types/">
                <METHOD xmlns="">updateTechnician</METHOD>
                <TASK_ORDER_NO xmlns="">${taskOrderNo}</TASK_ORDER_NO>
                <STAFF_CODE xmlns="">${staffCode}</STAFF_CODE>
            </updateTechnician>
        </Body>
    </Envelope>`;

    this.logger.info(
      {
        event: 'UPDATE-INSTALLATION-STAFF-TO-QRUN',
        taskOrderNo,
      },
      body,
    );

    const resp = await this.client.post('/updateTechnician', {
      data: body,
      headers: { 'Content-Type': 'text/xml' },
    });

    this.logger.info(
      {
        event: 'UPDATE-INSTALLATION-STAFF-TO-QRUN',
        taskOrderNo,
      },
      JSON.stringify(resp),
    );

    const respStatusCode = String(resp).match(/<code>(.*)(?:<\/code>)/);
    if (respStatusCode === null) {
      throw new InternalError(`unable parse response status in body: ${resp}`);
    }

    const respMsg = String(resp).match(/<Msg>(.*)(?:<\/Msg>)/);
    if (respMsg === null) {
      throw new InternalError(`unable parse response Msg in body: ${resp}`);
    }

    if (respStatusCode[1] == STATUS_CODE.ERROR) {
      throw new InternalError(
        `unable updateTechnicianInTask by taskOrderNo, staffCode and cause (${taskOrderNo} , ${staffCode}, ${respMsg[1]})`,
      );
    }

    return { code: STATUS_CODE.SUCCESS, Msg: respMsg[1] };
  }

  async updateCallLog(
    data: IUpdateCallLogRequest,
  ): Promise<IUpdateTechnicianInTaskResponse | null> {
    const xmlSchema = `
      <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
          <Body>
            <updateCallLog xmlns="http://oss.zsmart.ztesoft.com/wfm/webservice/types/">
              <METHOD xmlns="">updateCallLog</METHOD>
              <STAFF_CODE xmlns="">${data.staffCode}</STAFF_CODE>
              <STAFF_NAME xmlns="">${data.staffName}</STAFF_NAME>
              <TASK_ORDER_NO xmlns="">${data.taskOrderNo}</TASK_ORDER_NO>
              <CONTACT_NAME xmlns="">${data.contactName}</CONTACT_NAME>
              <CONTACT_NUMBER xmlns="">${data.contactNumber}</CONTACT_NUMBER>
              <NUMBER_TYPE xmlns="">Contact Tel</NUMBER_TYPE>
              <CALL_TIME xmlns="">${data.callTime}</CALL_TIME>
            </updateCallLog>
          </Body>
      </Envelope>
    `;

    const xmlResponse = (await this.client.post('/updateCallLog', {
      data: xmlSchema,
      headers: { 'Content-Type': 'text/xml' },
    })) as string;

    const responseObject = JSON.parse(parser.toJson(xmlResponse || ''));

    const updateCallLogResponse: IUpdateCallLogResponse | null = R.pathOr(
      { code: STATUS_CODE.ERROR, Msg: 'No response' },
      ['soapenv:Envelope', 'soapenv:Body', 'ns1:updateCallLogResponse'],
      responseObject,
    );

    const { code, Msg } = updateCallLogResponse;
    return { code, Msg };
  }
}
