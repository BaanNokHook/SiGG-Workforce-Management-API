import { ITask, ITaskResponse } from '@melonade/melonade-client';
import * as moment from 'moment-timezone';
import { BadRequestError } from 'routing-controllers';
import { Inject } from 'typedi';
import { formatDateTime } from '../../../utils/prepareTask/formatDateTime';
import { OrderService } from '../../restClient/order/order.service';
import { IAssuranceOrder, PRIORITY } from '../../restClient/order/type';
import { MelonadeAbstraction } from '../melonade.abstraction';

interface IPrepareTask {
  address: any;
  information: any;
  appointment: any;
  taskType?: any;
  extensionFlow?: string;
  staffs: any[];
  direction: string;
  projectId: string;
  companyId: string;
  remarks?: any;
  note: string;
  standardTimeLength: number;
  orderId: string;
  windowTime?: string[];
  priority?: PRIORITY;
  requireSkills?: any[];
}

interface IDriverRouteLocation {
  id: string;
  lat: number;
  lng: number;
  timeWindowStart: number;
  timeWindowEnd: number;
  planStartTime: string;
  planFinishTime: string;
  travelingTime: number;
  serviceTime: number;
  date?: string;
}

interface IPlanTime {
  travelingTime: number;
  planStartTime: string;
  planFinishTime: string;
}
export class WFM_ASSURANCE_TRANSFORM_DATA_FOR_CREATE_TASK extends MelonadeAbstraction {
  readonly taskName = 'wfm_assurance_transform_data_for_create_task';

  readonly WORKFLOW_EXTENSION_CREATE_TRIP = 'WFM_CREATE_TRIP';
  readonly WORKFLOW_EXTENSION_DROP_NODES = 'WFM_DROP_NODES';

  constructor(@Inject('OrderService') private orderService: OrderService) {
    super();
  }

  getPlanTimeFromDateAndRouteTime(
    date: string,
    route: IDriverRouteLocation,
  ): IPlanTime {
    const dateSplit = date.split('-');
    if (dateSplit.length !== 3) {
      throw new BadRequestError(`Invalid date format (${date})`);
    }

    const year = dateSplit[0];
    const month = dateSplit[1];
    const day = dateSplit[2];

    const startTimeHourAndMin = route.planStartTime.split(':');
    const finishTimeHourAndMin = route.planFinishTime.split(':');
    if (startTimeHourAndMin.length !== 2 || finishTimeHourAndMin.length !== 2) {
      throw new BadRequestError(
        `Invalid time format ${route.planStartTime}) - ${route.planFinishTime}`,
      );
    }

    const planStartTime = new Date(
      Number(year),
      Number(month),
      Number(day),
      Number(startTimeHourAndMin[0]),
      Number(startTimeHourAndMin[1]),
    );

    const planFinishTime = new Date(
      Number(year),
      Number(month),
      Number(day),
      Number(finishTimeHourAndMin[0]),
      Number(finishTimeHourAndMin[1]),
    );

    // force gmt to utc time
    planStartTime.setHours(planStartTime.getHours() - 7);
    planFinishTime.setHours(planFinishTime.getHours() - 7);

    return {
      travelingTime: route.travelingTime,
      planStartTime: formatDateTime(planStartTime),
      planFinishTime: formatDateTime(planFinishTime),
    };
  }

  transformDataToOmsOrderToPrepareTask(
    order: IAssuranceOrder,
    route: IDriverRouteLocation,

    staffId?: string,
  ): IPrepareTask {
    let windowTimes: string[] = [];

    if (order.workflowInput.ticket.queue !== 'A') {
      throw new BadRequestError(
        `Not support order not queue A (${order.orderId})`,
      );
    }

    let address = order.workflowInput?.address;
    let ticket = order.workflowInput?.ticket;
    let appointment = order.workflowInput?.appointment;
    let metaInformation = order.workflowInput?.metaInformation;
    let taskTypeId = order.workflowInput?.taskType?._id;
    let priority = order.workflowInput.priority ?? PRIORITY.Medium;
    let standardTimeLength = 0;

    if (appointment) {
      const planTime = this.getPlanTimeFromDateAndRouteTime(
        appointment.appointmentDate,
        route,
      );

      // UTC TIME
      metaInformation.orderBaseInformation.travelingTime =
        planTime.travelingTime;
      metaInformation.orderBaseInformation.planStartTime =
        planTime.planStartTime;
      metaInformation.orderBaseInformation.planFinishTime =
        planTime.planFinishTime;

      windowTimes = [planTime.planStartTime, planTime.planFinishTime];
    }

    let staffs: string[] = [];
    if (staffId && staffId !== '') {
      staffs.push(staffId);
    }

    ticket.metaInformation = metaInformation;

    const tranformed = {
      address: address,
      information: {
        ...ticket,
        orderType: order.workflowInput?.orderType || undefined,
      },
      appointment: appointment,
      taskType: taskTypeId,
      staffs: staffs,
      direction: 'REPAIR',
      projectId: '5cf0ad79b603c7605955bc7f',
      companyId: '5cee7a9bfc47036f05b13847',
      remarks: null,
      note: '',
      standardTimeLength: standardTimeLength,
      orderId: order.orderId,
      windowTime: windowTimes,
      priority: priority,
      requireSkills: order.workflowInput?.taskType.skills || [],
    };

    this.logger.debug(
      {
        event: this.taskName,
      },
      {
        tranformed,
        order,
      },
    );

    return tranformed;
  }

  async process(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const { vehicleID, route, originalInput } = input;

    // support other sub-workflow input (wfm_created_order)
    if (!vehicleID && !route) {
      return super.workerCompleted(originalInput);
    }

    this.logger.debug(
      {
        event: 'wfm_assurance_transform_data_for_create_task',
        vehicleID: vehicleID,
      },
      { routeIds: route.map((route: any) => route.id) },
    );

    // for support dropNode queue r
    if (!vehicleID && !route) {
      return { ...input, transactionId };
    }

    let filterRoutes: any[] = route;

    let workflowExtension = this.WORKFLOW_EXTENSION_DROP_NODES;
    if (vehicleID !== '') {
      workflowExtension = this.WORKFLOW_EXTENSION_CREATE_TRIP;
      filterRoutes = route.slice(1, filterRoutes.length - 1);
    }

    let orderIds = filterRoutes.map((r: any) => r.id);

    const orders = await this.orderService.getOrderByIds<IAssuranceOrder>(
      orderIds,
    );
    const existsOrderIds = orders.map(
      (order: IAssuranceOrder) => order.orderId,
    );

    if (orderIds.length !== orders.length) {
      this.logger.info(
        {
          event: 'wfm_assurance_transform_data_for_create_task.order_not_found',
        },
        `Not found some orders in list: ${orderIds}`,
      );
    }

    const tasks = filterRoutes
      .filter(
        (route: IDriverRouteLocation) =>
          existsOrderIds.indexOf(route.id) !== -1,
      )
      .filter((route: IDriverRouteLocation) => {
        const order = orders.filter((order) => order.orderId === route.id);
        const currentOrder: IAssuranceOrder = order[0];
        const routeDate = route.date
          ? route.date
          : moment.tz('Asia/Bangkok').format('YYYY-MM-DD');
        const orderAppointmentDate =
          currentOrder.workflowInput.appointment.appointmentDate;
        return (
          routeDate == orderAppointmentDate &&
          currentOrder.currentOrderStatus === 'WFM_WAIT_FOR_OPTIMIZE'
        );
      })
      .map((route: IDriverRouteLocation) => {
        const order = orders.filter((order) => order.orderId === route.id);
        return this.transformDataToOmsOrderToPrepareTask(
          order[0],
          route,
          vehicleID,
        );
      });

    const order = {
      tasks: tasks,
      extensionType: 'QRUN',
      extensionFlow: workflowExtension,
      note: '',
      orderId: tasks[0].orderId,
    };

    const output = {
      input,
      transactionId,
      order,
    };

    return super.workerCompleted(output);
  }

  async compensate(task: ITask): Promise<ITaskResponse> {
    const { input, transactionId } = task;
    const output = { input, transactionId };
    return super.workerCompleted(output);
  }
}
