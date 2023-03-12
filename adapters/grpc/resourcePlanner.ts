import * as grpc from '@grpc/grpc-js';
import { CoordinatorClient } from '@sendit-th/4pl-resource-planner-grpc-node/coordinator_grpc_pb';
import {
  ExecResult,
  Rule
} from '@sendit-th/4pl-resource-planner-grpc-node/coordinator_pb';
import { Inject, Service } from 'typedi';
import {
  ICapabilitiesRuleInput,
  IExecuteCapabilitiesRule,
  IExecuteFindTeamRule,
  IFindTeamInput
} from './resourcePlanner.interface';

@Service()
export class ResourcePlannerService {
  private client: CoordinatorClient;

  constructor(
    @Inject('config.resourcePlanner.RESOURCE_PLANNER_GRPC_URL')
    baseURL: string,
  ) {
    this.client = new CoordinatorClient(
      baseURL,
      grpc.credentials.createInsecure(),
    );
  }

  async executeRuleAppointmentCapabilities(ruleInput: ICapabilitiesRuleInput) {
    const ruleName = 'wfm_installation_appointment_capabilities';
    return (await this.executeRule(
      ruleName,
      ruleInput,
    )) as IExecuteCapabilitiesRule;
  }

  async executeRuleAppointmentFindTeam(
    ruleInput: IFindTeamInput,
    isSpecialPackage: boolean,
  ) {
    const ruleNormalPackage = 'wfm_installation_appointment_normal_package_v3';
    const ruleSpecialPackage =
      'wfm_installation_appointment_special_package_v3';
    const ruleName = isSpecialPackage ? ruleSpecialPackage : ruleNormalPackage;
    return (await this.executeRule(
      ruleName,
      ruleInput,
    )) as IExecuteFindTeamRule;
  }

  async executeRule(ruleName: string, input: Object, script?: string) {
    const rule = new Rule();

    if (script) rule.setScript(script);

    rule.setName(ruleName);
    rule.setInput(JSON.stringify(input));

    return new Promise((resolve, reject) => {
      this.client.exec(rule, (err: any, res?: ExecResult) => {
        if (err) reject(err);
        const result = res && JSON.parse(res.getResult());
        const logs = res && JSON.parse(res.getLogs());
        resolve({ result, logs });
      });
    });
  }
}
