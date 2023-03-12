import { consoleLogger } from '../../../logger';
import { FleetService } from './fleet.service';

describe('FleetService', () => {
  const fleetEndpoint = 'http://app-4pl-fleet-api.drivs.staging.tel.internal';
  const fleetService = new FleetService(fleetEndpoint, consoleLogger, {
    COMPANY_ID: 'test-company-id',
    PROJECT_ID: 'test-project-id',
    SCCD_EXPIRE_TIME: 60,
  });

  test('get teams by teamCodes', async () => {
    const teamCodes = ['9502_9502', 'ITEAM002', '9601_9601'];
    const teams = await fleetService.getTeamsByTeamCodes(teamCodes, 50);

    expect(teams.length).toEqual(3);
    for (const team of teams) {
      expect(teamCodes.includes(team.code)).toBeTruthy();
    }
  });

  test('get teams by teamCodes with invalid input', async () => {
    const teamCodes = [''];
    const teams = await fleetService.getTeamsByTeamCodes(teamCodes, 50);

    expect(teams.length).toEqual(0);
  });

  test('get staffs by teamIds', async () => {
    const teamIds = ['5f476de9bb7eeb001c5e1504', '5f990aabaf63210024fbd00d'];
    const staffs = await fleetService.getStaffsByTeamIds(teamIds, 50, {});

    expect(staffs.length).toEqual(1);
    for (const staff of staffs) {
      expect(
        staff.teamIds.some((teamId: any) => teamIds.includes(teamId)),
      ).toBeTruthy();
    }
  });

  test('get staffShifts by staffId and date', async () => {
    const staffId = '5e74af159083be001c82b8b6';
    const date = '2020-07-15';
    const staffShifts = await fleetService.getStaffShiftsByStaffIdAndDate(
      [staffId],
      date,
      50,
    );

    expect(staffShifts.length).toEqual(1);
    expect(staffShifts[staffId]).toEqual(staffId);
  });

  test('get shifts by shiftId', async () => {
    const shiftId = '5f717712e55f780024f0c259';

    const shift = await fleetService.getShift([shiftId], 50);

    expect(shift[0]._id).toEqual(shiftId);
  });

  test('get start/end work time of staff', async () => {
    const staffId = '5d856ff05554f8003ac27439';
    const staffWorkHourDetail = await fleetService.getStaffStartAndEndWorkTimes(
      ['5d856ff05554f8003ac27439'],
      '2020-11-04',
      50,
    );

    expect(staffWorkHourDetail[staffId].startWorkAt).toEqual(800);
    expect(staffWorkHourDetail[staffId].endWorkAt).toEqual(2200);
    expect(staffWorkHourDetail[staffId].timeSlots.length).toEqual(13);
  });

  test('get start/end work time of staff', async () => {
    const staffId = '5d856ff05554f8003ac27439';
    const staffWorkHourDetail = await fleetService.getStaffStartAndEndWorkTimes(
      [staffId],
      '2020-11-04',
      50,
    );

    expect(staffWorkHourDetail[staffId].startWorkAt).toEqual(800);
    expect(staffWorkHourDetail[staffId].endWorkAt).toEqual(2200);
    expect(staffWorkHourDetail[staffId].timeSlots.length).toEqual(13);
  });

  test('get staff by id', async () => {
    const staff = await fleetService.getStaff('5fadf8b1a81c46002508b854');

    expect(staff?._id).toEqual('5fadf8b1a81c46002508b854');
    expect(staff?.metaData.staffCode).toEqual('10900TH008');
  });

  test('get staff not found should return undefined', async () => {
    const staff = await fleetService.getStaff('5fadf8b1a81c46002508b856');

    expect(staff).toBeUndefined();
  });

  test('get workSchedules by staffIds', async () => {
    const dictStaffWithWorkSchedules = await fleetService.getWorkSchedulesByStaffIds(
      ['5fc762a720e124414580c2d9', '5fe983eaa7878e0012de792c'],
      '2020-12-28',
      '2020-12-28',
    );

    expect(
      dictStaffWithWorkSchedules['5fc762a720e124414580c2d9'].length,
    ).toEqual(3);
    expect(
      dictStaffWithWorkSchedules['5fe983eaa7878e0012de792c'],
    ).toBeUndefined();
  });
});
