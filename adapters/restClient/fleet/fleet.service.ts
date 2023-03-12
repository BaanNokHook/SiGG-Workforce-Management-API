import * as moment from 'moment-timezone';
import { Inject, Service } from 'typedi';
import { STATUS_CODE } from '../../../api/rest/utils/responseHelper';
import { SystemConfig } from '../../../config';
import { IAppointmentResponse } from '../../../domains/appointment/interface';
import {
  InternalError,
  NotFound,
  ValidateFieldError
} from '../../../errors/errors';
import { RestClient } from '../../../libraries/client/restClient';
import { ILogger } from '../../../libraries/logger/logger.interface';
import { consoleLogger } from '../../../logger';
import { chunk } from '../../../utils/chunk';
import {
  IAppointment,
  IChangeAppointmentRequest,
  ICreateAppointmentRequest
} from './appointment';
import {
  IDictStaffWorkHourDetail,
  IShift,
  IStaffWorkHourDetail,
  ITimeSlot
} from './shift';
import { IStaff } from './staff';
import { IStaffHoliday } from './staffHoliday';
import {
  convertStaffShiftToDictStaffWithShiftDates,
  IDictStaffWithShiftDates,
  IStaffShift
} from './staffShift';
import { ITeam } from './team';
import { ITeamsOpportunities } from './teamsopportunities';
import { IData, IDictStaffWithTimeSlots, IGetsResponse } from './type';
import {
  convertWorkSchedulesToDictStaffWithWorkSchedules,
  IDictStaffWithWorkSchedules,
  IWorkSchedule
} from './workschedule';

@Service('FleetService')
export class FleetService {
  private client: RestClient;

  constructor(
    @Inject('config.fms.FMS_URL')
    baseURL: string,

    @Inject('logger')
    private logger: ILogger = consoleLogger,

    @Inject('config.system')
    private systemConfig: SystemConfig,
  ) {
    this.client = new RestClient({
      baseURL,
    });
  }

  async getTeamByIds(teamIds: string[], chunkSize: number): Promise<ITeam[]> {
    const listTeamIds = chunk(teamIds, chunkSize);
    let resultTeams: ITeam[] = [];

    for await (const teamIds of listTeamIds) {
      const teams = await this.getTeamsByIDs(teamIds);

      if (!teams || teams.length === 0) continue;

      resultTeams.push(...teams);
    }

    return resultTeams;
  }

  async getTeamsByIDs(teamIds: string[], options?: Object): Promise<ITeam[]> {
    const queryCondition = { _id: { $in: teamIds } };
    const resp = await this.client.get<IGetsResponse<IData<ITeam>>>(
      `/v1/teams`,
      {
        params: {
          search: JSON.stringify(queryCondition),
          limit: 5000,
          ...options,
        },
      },
    );

    if (resp && resp.statusCodes != STATUS_CODE.OK) {
      throw new InternalError(`Unable get teams by teamIds (${teamIds})`);
    }

    if (!resp?.data?.data || resp?.data?.data.length === 0) {
      return Promise.resolve([]);
    }

    return resp?.data?.data;
  }

  async getTeamsByTeamCodes(
    teamCodes: string[],
    chunkSize: number,
  ): Promise<ITeam[]> {
    const listTeamCodes = chunk(teamCodes, chunkSize);
    let resultTeams: ITeam[] = [];

    for await (const teamCodes of listTeamCodes) {
      const queryCondition = {
        code: {
          $in: teamCodes,
        },
      };

      const selectFields = {
        code: 1,
      };

      const query = `?search=${JSON.stringify(
        queryCondition,
      )}&limit=5000&select=${JSON.stringify(selectFields)}`;
      const resp = await this.client.get<IGetsResponse<IData<ITeam>>>(
        `/v1/teams${query}`,
      );

      if (resp && resp.statusCodes != STATUS_CODE.OK) {
        throw new InternalError(`Unable get teams by teamCodes (${teamCodes})`);
      }

      if (!resp?.data?.data || resp?.data?.data.length === 0) {
        continue;
      }

      resultTeams.push(...resp?.data?.data);
    }

    return resultTeams;
  }

  async getStaffsByTeamIds(
    teamIds: string[],
    chunkSize: number,
    filters: {},
  ): Promise<IStaff[]> {
    const listTeamIds = chunk(teamIds, chunkSize);
    let resultStaffs: IStaff[] = [];

    for await (const teamIds of listTeamIds) {
      const queryCondition = {
        teamIds: {
          $in: teamIds,
        },
        'metaData.isActive': true,
        ...filters,
      };

      const query = `?search=${JSON.stringify(queryCondition)}&limit=5000`;
      const resp = await this.client.get<IGetsResponse<IData<IStaff>>>(
        `/v1/staff${query}`,
      );

      if (resp && resp.statusCodes != STATUS_CODE.OK) {
        throw new InternalError(`unable get staffs by teamIds (${teamIds})`);
      }

      if (!resp?.data?.data || resp?.data?.data.length === 0) {
        continue;
      }

      resultStaffs.push(...resp?.data?.data);
    }

    return resultStaffs;
  }

  async getWorkSchedulesByStaffIds(
    staffIds: string[],
    startDate: string,
    endDate: string,
  ): Promise<IDictStaffWithWorkSchedules> {
    let resultWorkSchedules: IWorkSchedule[] = [];

    const startDateISOString = moment(startDate).startOf('day').toISOString();
    const endDateISOString = moment(endDate).endOf('day').toISOString();

    const chunkStaffIds = chunk(staffIds, 80);
    for await (const ids of chunkStaffIds) {
      const queryCondition = {
        staffId: {
          $in: ids,
        },
        windowTime: {
          $gte: startDateISOString,
          $lt: endDateISOString,
        },
      };

      const query = `?search=${JSON.stringify(queryCondition)}&limit=5000`;
      const resp = await this.client.get<IGetsResponse<IData<IWorkSchedule>>>(
        `/v1/workSchedules${query}`,
      );

      if (resp && resp.statusCodes != STATUS_CODE.OK) {
        throw new InternalError(
          `unable get workSchedules by staffIds (${ids}) date: ${startDate} - ${endDate}`,
        );
      }

      if (!resp || !resp.data) {
        continue;
      }

      resultWorkSchedules.push(...resp.data.data);
    }

    return convertWorkSchedulesToDictStaffWithWorkSchedules(
      resultWorkSchedules,
    );
  }

  async getStaffShiftsByStaffIdAndDate(
    staffIds: string[],
    date: string,
    chunkSize: number,
  ): Promise<IDictStaffWithShiftDates> {
    const listStaffIds = chunk(staffIds, chunkSize);
    let resultStaffShift: IStaffShift[] = [];

    for await (const staffIds of listStaffIds) {
      const queryCondition = {
        staffId: staffIds,
        date: date,
      };

      const query = `?search=${JSON.stringify(queryCondition)}&limit=5000`;
      const resp = await this.client.get<IGetsResponse<IData<IStaffShift>>>(
        `/v1/staffShifts${query}`,
      );

      if (resp && resp.statusCodes != STATUS_CODE.OK) {
        throw new InternalError(
          `unable get staffShifts by staffId and date (${staffIds} , ${date})`,
        );
      }

      if (!resp?.data?.data || resp?.data?.data.length === 0) {
        continue;
      }

      resultStaffShift.push(...resp?.data?.data);
    }

    return convertStaffShiftToDictStaffWithShiftDates(resultStaffShift);
  }

  async getStaff(staffId: string): Promise<IStaff | undefined> {
    try {
      const resp = await this.client.get<IGetsResponse<IStaff>>(
        `/v1/staff/${staffId}`,
      );

      return resp?.data;
    } catch (err) {
      if (err?.data?.statusCode === 404) {
        return undefined;
      }

      throw err;
    }
  }

  async getStaffs(staffIds: string[]): Promise<IStaff[]> {
    const queryCondition = {
      _id: {
        $in: staffIds,
      },
    };
    const query = `?search=${JSON.stringify(queryCondition)}&limit=5000`;
    const resp = await this.client.get<IGetsResponse<IData<IStaff>>>(
      `/v1/staff${query}`,
    );

    return resp?.data?.data ?? [];
  }

  async getStaffsHasSkills(
    staffIds: string[],
    skills: string[],
  ): Promise<IStaff[]> {
    const queryCondition = {
      _id: {
        $in: staffIds,
      },
      'staffSkills.skill': {
        $in: skills,
      },
    };
    const query = `?search=${JSON.stringify(queryCondition)}&limit=5000`;
    const resp = await this.client.get<IGetsResponse<IData<IStaff>>>(
      `/v1/staff${query}`,
    );

    return resp?.data?.data ?? [];
  }

  async getShift(shiftIds: string[], chunkSize: number): Promise<IShift[]> {
    const listShiftIds = chunk(shiftIds, chunkSize);
    let resultShifts: IShift[] = [];

    for await (const shiftIds of listShiftIds) {
      const queryCondition = {
        _id: {
          $in: shiftIds,
        },
      };
      const query = `?search=${JSON.stringify(queryCondition)}&limit=5000`;
      const resp = await this.client.get<IGetsResponse<IData<IShift>>>(
        `/v1/shifts${query}`,
      );

      if (resp && resp.statusCodes != STATUS_CODE.OK) {
        throw new InternalError(`unable get shifts by shiftId (${shiftIds})`);
      }

      if (!resp?.data?.data || resp?.data?.data.length === 0) {
        continue;
      }

      resultShifts.push(...resp?.data?.data);
    }

    return resultShifts;
  }

  async getShifts(shiftIds: string[]): Promise<IShift[]> {
    const queryCondition = {
      _id: {
        $in: shiftIds,
      },
    };

    const query = `?search=${JSON.stringify(queryCondition)}&limit=5000`;
    const resp = await this.client.get<IGetsResponse<IData<IShift>>>(
      `/v1/shifts${query}`,
    );

    if (resp && resp.statusCodes != STATUS_CODE.OK) {
      throw new InternalError(`unable get shifts by shiftId (${shiftIds})`);
    }

    return resp?.data?.data ?? [];
  }

  async getAllStaffShiftTimeSlots(
    dictStaffShiftDates: IDictStaffWithShiftDates,
    batchCount: number,
  ): Promise<IDictStaffWithTimeSlots> {
    const shiftIds = Object.values(dictStaffShiftDates).reduce(
      (acc, cur) => [...acc, ...cur],
      [],
    );

    const shiftIdChunk = chunk(shiftIds, batchCount);

    const allShifts = await Promise.all(
      shiftIdChunk.map(async (shiftSet) => {
        const shiftIds = shiftSet.map((staffShift) => staffShift.shiftDate[0]);
        const shifts = await this.getShifts(shiftIds);
        return shifts;
      }),
    );

    const shiftKV: { [key: string]: ITimeSlot[] } = allShifts
      .reduce((acc, cur) => [...acc, ...cur], [])
      .reduce((acc, cur) => ({ ...acc, [cur._id]: cur.timeslot }), {});

    const staffWithTimeSlot = Object.entries(dictStaffShiftDates).reduce(
      (acc, [staffID, shiftDates]) => ({
        ...acc,
        [staffID]: shiftDates
          .map((staffShift) => shiftKV[staffShift.shiftDate[0]])
          .reduce((acc, cur) => [...acc, ...cur]),
      }),
      {},
    );

    return staffWithTimeSlot;
  }

  async getStaffStartAndEndWorkTimes(
    staffIds: string[],
    date: string,
    chunkSize: number,
  ): Promise<IDictStaffWorkHourDetail> {
    const dictStaffShifts = await this.getStaffShiftsByStaffIdAndDate(
      staffIds,
      date,
      chunkSize,
    );

    const dictStaffWithTimeSlots = await this.getAllStaffShiftTimeSlots(
      dictStaffShifts,
      chunkSize,
    );

    let dictStaffWorkHourDetail: IDictStaffWorkHourDetail = {};
    for await (const staffId of staffIds) {
      const staffWithTimeSlot = dictStaffWithTimeSlots[staffId];
      if (!staffWithTimeSlot) {
        continue;
      }

      if (!dictStaffWorkHourDetail[staffId]) {
        dictStaffWorkHourDetail[staffId] = {} as IStaffWorkHourDetail;
      }

      const workStartAt = Number(staffWithTimeSlot[0].from.replace(':', ''));
      const workEndAt = Number(
        staffWithTimeSlot[staffWithTimeSlot.length - 1].to.replace(':', ''),
      );

      dictStaffWorkHourDetail[staffId] = {
        staffId: staffId,
        timeSlots: staffWithTimeSlot,
        startWorkAt: workStartAt,
        endWorkAt: workEndAt,
      };
    }

    return dictStaffWorkHourDetail;
  }

  async getStaffsHoliday(staffIds: string[], date: string) {
    // pass date
    const startDate = moment(date).startOf('day').toISOString();
    const endDate = moment(date).endOf('day').toISOString();

    const query = JSON.stringify({
      staffId: { $in: staffIds },
      startDateTime: { $lt: endDate },
      endDateTime: { $gt: startDate },
    });

    try {
      const resp = await this.client.get<IGetsResponse<IData<IStaffHoliday>>>(
        `/v1/staff-holiday?search=${query}`,
      );

      return resp?.data?.data || [];
    } catch (error) {
      throw new InternalError(`unable get staff vacation error: ${error}`);
    }
  }

  async getTeamsByAreaCodes(
    areaCodes: string[],
    selectFields?: string[],
    limit?: number,
    page?: number,
  ): Promise<ITeam[]> {
    const search = {
      'zone.areaCode': {
        $in: areaCodes,
      },
    };
    const select = selectFields?.reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: true,
      }),
      {},
    );

    const response = await this.client.get<IGetsResponse<IData<ITeam>>>(
      '/v1/teams',
      {
        params: {
          search,
          select,
          limit,
          page,
        },
      },
    );

    if (!response?.data?.data) {
      const err = new NotFound('getTeamsByAreaCodes: teams not found');
      this.logger.error(err, {
        event: 'PRE_PROCESS_OPTIMIZE',
        areaCodes,
        message: err.message,
      });

      throw err;
    }

    return response.data.data;
  }

  async getTeamByAreaCode(
    areaCode: string,
    taskTypeGroupIds: string[],
  ): Promise<ITeam[]> {
    let resultTeams: ITeam[] = [];
    const taskTypeGroupIdsQuery = !!taskTypeGroupIds.length
      ? { 'zone.taskTypeGroupIds': { $in: taskTypeGroupIds } }
      : {};
    const resp = await this.client.post<IGetsResponse<IData<ITeam>>>(
      `/v1/teams/search-and-options`,
      {
        data: {
          search: {
            'zone.areaCode': areaCode,
            ...taskTypeGroupIdsQuery,
          },
          options: {
            limit: 5000,
          },
        },
        headers: {
          'company-id': this.systemConfig.COMPANY_ID,
          'project-id': this.systemConfig.PROJECT_ID,
        },
      },
    );

    if (resp?.data?.data) {
      resultTeams.push(...resp?.data?.data);
    }

    return resultTeams;
  }

  async getTeamById(teamId: string): Promise<ITeam> {
    const resp = await this.client.get<IGetsResponse<IData<ITeam>>>(
      `/v1/teams/${teamId}`,
    );

    const team = {
      ...resp?.data,
    } as ITeam;

    return team;
  }

  async getAppointment(appointmentNo: string) {
    try {
      if (!appointmentNo) {
        throw new ValidateFieldError('appointmentNo is required');
      }

      const response = await this.client.get<IGetsResponse<IAppointment>>(
        `/v1/appointments/${appointmentNo}`,
      );

      this.logger.info({ event: 'getAppointment', appointmentNo });
      return response?.data as IAppointment;
    } catch (err) {
      this.logger.error({
        err,
        event: 'getAppointment',
        appointmentNo,
      });
      throw err;
    }
  }

  // TODO: add get appointment v2
  async getInstallationAppointment(appointmentNo: string) {
    try {
      if (!appointmentNo) {
        throw new ValidateFieldError('appointmentNo is required');
      }
      console.log(`/v2/installation/appointment/${appointmentNo}`);
      const response = await this.client.get<IAppointment>(
        `/v2/installation/appointment/${appointmentNo}`,
      );
      console.log(`response____`, response);

      this.logger.info({ event: 'getInstallationAppointment', appointmentNo });
      return response as IAppointment;
    } catch (err) {
      this.logger.error({
        err,
        event: 'getInstallationAppointment',
        appointmentNo,
      });
      throw err;
    }
  }

  async createAppointment(
    req: ICreateAppointmentRequest,
  ): Promise<IAppointment> {
    const resp = await this.client.post<IAppointment>(
      `/v2/installation/appointment`,
      {
        data: req,
      },
    );
    this.logger.info(
      {
        event: 'reserve_appointment_service',
        teamId: req?.metaData?.teamId,
        teamName: req?.metaData?.teamName,
      },
      JSON.stringify(req),
    );
    return resp as IAppointment;
  }

  async changeAppointment(
    appointmentNo: string,
    req: IChangeAppointmentRequest,
  ): Promise<IAppointment> {
    const resp = await this.client.put<IAppointment>(
      `/v2/installation/appointment/change/${appointmentNo}`,
      {
        data: req,
      },
    );
    this.logger.info(
      {
        event: 'change_appointment_service',
        appointmentNo,
      },
      JSON.stringify(req),
    );
    return resp as IAppointment;
  }

  async cancelAppointment(appointmentNo: string) {
    try {
      if (!appointmentNo) {
        throw new ValidateFieldError('appointmentNo is required');
      }

      const response = await this.client.put<any>(
        `/v2/installation/appointment/cancel/${appointmentNo}`,
      );

      this.logger.info({
        event: 'cancel_appointment_service',
        appointmentNo,
      });
      return response?.message;
    } catch (err) {
      this.logger.error({
        err,
        event: 'cancel_appointment_service',
        appointmentNo,
      });
      throw err;
    }
  }

  public async checkAppointment(
    staffId: string,
    timeSlot: string,
    date: string,
  ): Promise<IAppointmentResponse> {
    const res = await this.client.post<IGetsResponse<IAppointmentResponse>>(
      `/v1/appointments/check-appointment`,
      {
        data: {
          staffId: staffId,
          timeSlot: timeSlot,
          appointmentDate: date,
        },
      },
    );

    return res?.data as IAppointmentResponse;
  }

  async calculateTeamsOpportunities(
    areaCode: string,
    taskTypeGroupId: string,
    accMode: string,
    eventCodes: string[],
  ): Promise<ITeamsOpportunities> {
    const resp = await this.client.post(`/v1/teams-opportunities/calculation`, {
      data: { areaCode, accMode, eventCodes, taskTypeGroupId },
    });
    this.logger.info(
      {
        event: 'calculate_teams_opportunities_service',
        accMode,
        eventCodes,
      },
      JSON.stringify(resp),
    );
    return resp as ITeamsOpportunities;
  }
}
