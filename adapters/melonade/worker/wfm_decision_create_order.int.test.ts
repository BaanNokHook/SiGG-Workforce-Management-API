import Container from 'typedi';
import '../../../bootstrapCache';
import '../../../bootstrapLogger';
import { TmsService } from '../../../services/tms/tms.service';
import { WFM_DECISION_CREATE_ORDER } from './wfm_decision_create_order';

const DSLAM_CONFIG = {
  "FTTB_FLP_JOIN": [
    {
      "basedProd": "HSI",
      "prodEventCodes": [],
      "serviceOrderAttrs": [],
      "zone": "FTTB_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    }
  ],
  "FTTB_HSI_CHANGE_SPEED_FLP_JOIN": [
    {
      "basedProd": "HSI",
      "prodEventCodes": [
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [
        "CHANGE_CARD_FLAG"
      ],
      "zone": "FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "HSI",
      "prodEventCodes": [
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [],
      "zone": "FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "HSI+DSLB",
      "prodEventCodes": [
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [],
      "zone": "FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "HSI+DSLB",
      "prodEventCodes": [
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [
        "CHANGE_CARD_FLAG"
      ],
      "zone": "FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "HSI+DSTV",
      "prodEventCodes": [
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [],
      "zone": "FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "HSI+DSTV",
      "prodEventCodes": [
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [
        "CHANGE_CARD_FLAG"
      ],
      "zone": "FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    }
  ],
  "FTTB_HSI_CHANGE_SPEED": [
    {
      "basedProd": "HSI+FLP",
      "prodEventCodes": [
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [
        "CHANGE_CARD_FLAG"
      ],
      "zone": "FTTB_HSI_CHANGE_SPEED_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    }
  ],
  "FTTB_HSI_CHANGE_SPEED_FLP_JOIN_DSTV/DSLB_CHANGE_TV_PACKAGE": [
    {
      "basedProd": "HSI+DSLB",
      "prodEventCodes": [
        "CHANGE_TV_PACKAGE",
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [],
      "zone": "FTTB_HSI_CHANGE_SPEED_FLP_JOIN_DSTV/DSLB_CHANGE_TV_PACKAGE_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "HSI+DSLB",
      "prodEventCodes": [
        "CHANGE_TV_PACKAGE",
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [
        "CHANGE_CARD_FLAG"
      ],
      "zone": "FTTB_HSI_CHANGE_SPEED_FLP_JOIN_DSTV/DSLB_CHANGE_TV_PACKAGE_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "HSI+DSTV",
      "prodEventCodes": [
        "CHANGE_TV_PACKAGE",
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [],
      "zone": "FTTB_HSI_CHANGE_SPEED_FLP_JOIN_DSTV/DSLB_CHANGE_TV_PACKAGE_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "HSI+DSTV",
      "prodEventCodes": [
        "CHANGE_TV_PACKAGE",
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [
        "CHANGE_CARD_FLAG"
      ],
      "zone": "FTTB_HSI_CHANGE_SPEED_FLP_JOIN_DSTV/DSLB_CHANGE_TV_PACKAGE_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    }
  ],
  "FTTB_FLP_JOIN_DSTV/DSLB_CHANGE_TV_PACKAGE": [
    {
      "basedProd": "HSI+DSLB",
      "prodEventCodes": [
        "CHANGE_TV_PACKAGE"
      ],
      "serviceOrderAttrs": [],
      "zone": "FTTB_FLP_JOIN_DSTV/DSLB_CHANGE_TV_PACKAGE_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "HSI+DSTV",
      "prodEventCodes": [
        "CHANGE_TV_PACKAGE"
      ],
      "serviceOrderAttrs": [],
      "zone": "FTTB_FLP_JOIN_DSTV/DSLB_CHANGE_TV_PACKAGE_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "DSLB",
      "prodEventCodes": [
        "CHANGE_TV_PACKAGE"
      ],
      "serviceOrderAttrs": [],
      "zone": "FTTB_FLP_JOIN_DSTV/DSLB_CHANGE_TV_PACKAGE_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "DSTV",
      "prodEventCodes": [
        "CHANGE_TV_PACKAGE"
      ],
      "serviceOrderAttrs": [],
      "zone": "FTTB_FLP_JOIN_DSTV/DSLB_CHANGE_TV_PACKAGE_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    }
  ],
  "FTTC_HSI_NEW": [
    {
      "basedProd": "",
      "prodEventCodes": [],
      "serviceOrderAttrs": [],
      "sub": "FTTC_HSI_NEW",
      "zone": "FTTC_HSI_NEW_JUMPER",
      "appointment": {
        "type": "deadline",
        "value": "60",
        "unit": "minute"
      },
      "assignTo": [
        "sub",
        "zone"
      ]
    }
  ],
  "FTTC_HSI_NEW_FLP_NEW": [
    {
      "basedProd": "",
      "prodEventCodes": [],
      "serviceOrderAttrs": [],
      "sub": "FTTC_HSI_NEW_FLP_NEW",
      "zone": "FTTC_HSI_NEW_FLP_NEW_JUMPER",
      "appointment": {
        "type": "deadline",
        "value": "60",
        "unit": "minute"
      },
      "assignTo": [
        "sub",
        "zone"
      ]
    }
  ],
  "FTTC_HSI_JOIN": [
    {
      "basedProd": "",
      "prodEventCodes": [],
      "serviceOrderAttrs": [],
      "sub": "FTTC_HSI_JOIN",
      "zone": "FTTC_HSI_JOIN_JUMPER",
      "appointment": {
        "type": "deadline",
        "value": "60",
        "unit": "minute"
      },
      "assignTo": [
        "sub",
        "zone"
      ]
    }
  ],
  "FTTC_FLP_JOIN": [
    {
      "basedProd": "HSI",
      "prodEventCodes": [],
      "serviceOrderAttrs": [],
      "zone": "FTTC_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "TV",
      "prodEventCodes": [],
      "serviceOrderAttrs": [],
      "sub": "FTTC_FLP_JOIN",
      "zone": "FTTC_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "deadline",
        "value": "60",
        "unit": "minute"
      },
      "assignTo": [
        "sub",
        "zone"
      ]
    }
  ],
  "FTTC_HSI_CHANGE_SPEED": [
    {
      "basedProd": "",
      "prodEventCodes": [
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [
        "CHANGE_CARD_FLAG",
        "CHANGE_MODEM_FLAG"
      ],
      "sub": "FTTC_HSI_CHANGE_SPEED",
      "zone": "FTTC_HSI_CHANGE_SPEED_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "0",
        "unit": "day"
      },
      "assignTo": [
        "sub",
        "zone"
      ]
    }
  ],
  "FTTC_HSI_CHANGE_SPEED_FLP_JOIN": [
    {
      "basedProd": "HSI",
      "prodEventCodes": [
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [],
      "zone": "FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "HSI",
      "prodEventCodes": [
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [
        "CHANGE_CARD_FLAG"
      ],
      "zone": "FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "1",
        "unit": "day"
      },
      "assignTo": [
        "zone"
      ]
    },
    {
      "basedProd": "HSI",
      "prodEventCodes": [
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [
        "CHANGE_MODEM_FLAG"
      ],
      "sub": "FTTC_HSI_CHANGE_SPEED_FLP_JOIN",
      "zone": "FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "0",
        "unit": "day"
      },
      "assignTo": [
        "sub",
        "zone"
      ]
    },
    {
      "basedProd": "HSI",
      "prodEventCodes": [
        "CHANGE_SPEED"
      ],
      "serviceOrderAttrs": [
        "CHANGE_CARD_FLAG",
        "CHANGE_MODEM_FLAG"
      ],
      "sub": "FTTC_HSI_CHANGE_SPEED_FLP_JOIN",
      "zone": "FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER",
      "appointment": {
        "type": "appointment",
        "value": "0",
        "unit": "day"
      },
      "assignTo": [
        "sub",
        "zone"
      ]
    }
  ]
}

const SERVICE_ORDER_ATTR = [
  {
    attrCode: 'CHANGE_MODEM_FLAG',
    attrName: 'CHANGE_MODEM_FLAG',
    value: 'Y',
    valueDesc: 'Y',
  },
  {
    attrCode: 'CHANGE_CARD_FLAG',
    attrName: 'CHANGE_CARD_FLAG',
    value: 'Y',
    valueDesc: 'Y',
  },
]

const PRODUCT_ORDER = [
  {
    prodEventCode: 'CHANGE_SPEED',
    product: {
      accessMode: 'FTTB',
      prodSpecCode: 'HSI',
    },
  },
]

// tslint:disable-next-line: max-func-body-length
const inputGenerator = (
  taskType = '60b61bb7252f54ff129a1b17',
  taskTypeCode = 'FTTC_HSI_NEW_FLP_NEW',
  basedProdSpec = 'HSI',
  serviceOrderAttr = SERVICE_ORDER_ATTR,
  productOrderList = PRODUCT_ORDER,
) => ({
  input: {
    DSLAMConfig: DSLAM_CONFIG,
    order: {
      tasks: [
        {
          taskType: taskType,
          taskTypeCode: taskTypeCode,
          information: {
            metaInformation: {
              installationInformation: {
                serviceOrderInfo: {
                  basedProdSpec: basedProdSpec,
                  serviceOrderAttribute: serviceOrderAttr,
                  productOrderList: productOrderList,
                },
              },
            },
          },
        },
      ],
    },
  },
});

describe('WFM_DECISION_CREATE_ORDER', () => {
  const tmsSvc: TmsService = Container.get(TmsService);

  const worker = new WFM_DECISION_CREATE_ORDER(tmsSvc);
  it('should be route to zone (FTTB_FLP_JOIN -> FTTB_FLP_JOIN_JUMPER) correctly', async () => {
    const soa: any[] = []
    const po: any[] = []
    const inputG = inputGenerator(
      '60f826183473393694ad27f4',
      'FTTB_FLP_JOIN',
      'HSI',
      soa,
      po,
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'ZONE',
        zone: {
          taskTypeId: '60f826183473393694ad27f4',
          taskTypeCode: 'FTTB_FLP_JOIN_JUMPER',
          durationAsMinutes: 60,
        },
        appointmentType: {
          type: 'appointment',
          value: '1',
          unit: 'day'
        },
      },
    });
  }, 5000);

  it('should be route to sub (FTTB_FLP_JOIN) correctly (not match with baseProdSpec)', async () => {
    const soa: any[] = []
    const po: any[] = []
    const inputG = inputGenerator(
      '60f826183473393694ad27f4',
      'FTTB_FLP_JOIN',
      'TV',
      soa,
      po,
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'SUB',
        sub: {
          taskTypeId: '60f826183473393694ad27f4',
          taskTypeCode: 'FTTB_FLP_JOIN',
        }
      },
    });
  });

  it('should be route to sub (FTTB_FLP_JOIN) correctly (not match with serviceOrderAttr, productOrderList)', async () => {
    const inputG = inputGenerator(
      '60f826183473393694ad27f4',
      'FTTB_FLP_JOIN',
      'HSI',
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'SUB',
        sub: {
          taskTypeId: '60f826183473393694ad27f4',
          taskTypeCode: 'FTTB_FLP_JOIN',
        }
      },
    });
  });

  it('should be route to zone (FTTB_HSI_CHANGE_SPEED_FLP_JOIN -> FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER) correctly', async () => {
    const soa: any[] = []
    const po: any[] = [
      {
        prodEventCode: 'CHANGE_SPEED',
        product: {
          accessMode: 'FTTB',
          prodSpecCode: 'HSI',
        },
      },
    ]
    const inputG = inputGenerator(
      '60f826183473393694ad2844',
      'FTTB_HSI_CHANGE_SPEED_FLP_JOIN',
      'HSI',
      soa,
      po,
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'ZONE',
        zone: {
          taskTypeId: '60f826183473393694ad2844',
          taskTypeCode: 'FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER',
        },
        appointmentType: {
          type: 'appointment',
          value: '1',
          unit: 'day'
        },
      },
    });
  });

  it('should be route to zone (FTTB_HSI_CHANGE_SPEED_FLP_JOIN -> FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER) correctly - 2', async () => {
    const soa: any[] = [
      {
        attrCode: 'CHANGE_CARD_FLAG',
        attrName: 'CHANGE_CARD_FLAG',
        value: 'Y',
        valueDesc: 'Y',
      },
    ]
    const po: any[] = [
      {
        prodEventCode: 'CHANGE_SPEED',
        product: {
          accessMode: 'FTTB',
          prodSpecCode: 'HSI',
        },
      },
    ]
    const inputG = inputGenerator(
      '60f826183473393694ad2844',
      'FTTB_HSI_CHANGE_SPEED_FLP_JOIN',
      'HSI',
      soa,
      po,
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'ZONE',
        zone: {
          taskTypeId: '60f826183473393694ad2844',
          taskTypeCode: 'FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER',
        },
        appointmentType: {
          type: 'appointment',
          value: '1',
          unit: 'day'
        },
      },
    });
  });

  it('should be route to zone (FTTB_HSI_CHANGE_SPEED_FLP_JOIN -> FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER) correctly - 3', async () => {
    const soa: any[] = []
    const po: any[] = [
      {
        prodEventCode: 'CHANGE_SPEED',
        product: {
          accessMode: 'FTTB',
          prodSpecCode: 'HSI',
        },
      },
    ]
    const inputG = inputGenerator(
      '60f826183473393694ad2844',
      'FTTB_HSI_CHANGE_SPEED_FLP_JOIN',
      'HSI+DSLB',
      soa,
      po,
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'ZONE',
        zone: {
          taskTypeId: '60f826183473393694ad2844',
          taskTypeCode: 'FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER',
        },
        appointmentType: {
          type: 'appointment',
          value: '1',
          unit: 'day'
        },
      },
    });
  });

  it('should be route to zone (FTTB_HSI_CHANGE_SPEED_FLP_JOIN -> FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER) correctly - 4', async () => {
    const soa: any[] = [
      {
        attrCode: 'CHANGE_CARD_FLAG',
        attrName: 'CHANGE_CARD_FLAG',
        value: 'Y',
        valueDesc: 'Y',
      },
    ]
    const po: any[] = [
      {
        prodEventCode: 'CHANGE_SPEED',
        product: {
          accessMode: 'FTTB',
          prodSpecCode: 'HSI',
        },
      },
    ]
    const inputG = inputGenerator(
      '60f826183473393694ad2844',
      'FTTB_HSI_CHANGE_SPEED_FLP_JOIN',
      'HSI+DSLB',
      soa,
      po,
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'ZONE',
        zone: {
          taskTypeId: '60f826183473393694ad2844',
          taskTypeCode: 'FTTB_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER',
        },
        appointmentType: {
          type: 'appointment',
          value: '1',
          unit: 'day'
        },
      },
    });
  });

  it('should be route to zone (FTTC_HSI_CHANGE_SPEED_FLP_JOIN -> FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER) correctly', async () => {
    const soa: any[] = []
    const po: any[] = [
      {
        prodEventCode: 'CHANGE_SPEED',
        product: {
          accessMode: 'FTTB',
          prodSpecCode: 'HSI',
        },
      },
    ]
    const inputG = inputGenerator(
      '60f68604eeb2e252bc2afb46',
      'FTTC_HSI_CHANGE_SPEED_FLP_JOIN',
      'HSI',
      soa,
      po,
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'ZONE',
        zone: {
          taskTypeId: '60f68604eeb2e252bc2afb46',
          taskTypeCode: 'FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER',
        },
        appointmentType: {
          type: 'appointment',
          value: '1',
          unit: 'day'
        },
      },
    });
  });

  it('should be route to zone (FTTC_HSI_CHANGE_SPEED_FLP_JOIN -> FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER) correctly - 2', async () => {
    const soa: any[] = [
      {
        attrCode: 'CHANGE_CARD_FLAG',
        attrName: 'CHANGE_CARD_FLAG',
        value: 'Y',
        valueDesc: 'Y',
      },
    ]
    const po: any[] = [
      {
        prodEventCode: 'CHANGE_SPEED',
        product: {
          accessMode: 'FTTB',
          prodSpecCode: 'HSI',
        },
      },
    ]
    const inputG = inputGenerator(
      '60f68604eeb2e252bc2afb46',
      'FTTC_HSI_CHANGE_SPEED_FLP_JOIN',
      'HSI',
      soa,
      po,
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'ZONE',
        zone: {
          taskTypeId: '60f68604eeb2e252bc2afb46',
          taskTypeCode: 'FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER',
        },
        appointmentType: {
          type: 'appointment',
          value: '1',
          unit: 'day'
        },
      },
    });
  });

  it('should be route to zone (FTTC_HSI_CHANGE_SPEED_FLP_JOIN -> FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER) correctly - 3', async () => {
    const soa: any[] = [
      {
        attrCode: 'CHANGE_MODEM_FLAG',
        attrName: 'CHANGE_MODEM_FLAG',
        value: 'Y',
        valueDesc: 'Y',
      },
    ]
    const po: any[] = [
      {
        prodEventCode: 'CHANGE_SPEED',
        product: {
          accessMode: 'FTTB',
          prodSpecCode: 'HSI',
        },
      },
    ]
    const inputG = inputGenerator(
      '60f68604eeb2e252bc2afb3e',
      'FTTC_HSI_CHANGE_SPEED_FLP_JOIN',
      'HSI',
      soa,
      po,
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'SUB_ZONE',
        zone: {
          taskTypeId: '60f68604eeb2e252bc2afb46',
          taskTypeCode: 'FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER',
        },
        sub: {
          taskTypeId: '60f68604eeb2e252bc2afb3e',
          taskTypeCode: 'FTTC_HSI_CHANGE_SPEED_FLP_JOIN',
        },
        appointmentType: {
          type: 'appointment',
          value: '0',
          unit: 'day'
        },
      },
    });
  });

  it('should be route to zone (FTTC_HSI_CHANGE_SPEED_FLP_JOIN -> FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER) correctly - 4', async () => {
    const soa: any[] = [
      {
        attrCode: 'CHANGE_CARD_FLAG',
        attrName: 'CHANGE_CARD_FLAG',
        value: 'Y',
        valueDesc: 'Y',
      },
      {
        attrCode: 'CHANGE_MODEM_FLAG',
        attrName: 'CHANGE_MODEM_FLAG',
        value: 'Y',
        valueDesc: 'Y',
      },
    ]
    const po: any[] = [
      {
        prodEventCode: 'CHANGE_SPEED',
        product: {
          accessMode: 'FTTB',
          prodSpecCode: 'HSI',
        },
      },
    ]
    const inputG = inputGenerator(
      '60f68604eeb2e252bc2afb3e',
      'FTTC_HSI_CHANGE_SPEED_FLP_JOIN',
      'HSI',
      soa,
      po,
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'SUB_ZONE',
        zone: {
          taskTypeId: '60f68604eeb2e252bc2afb46',
          taskTypeCode: 'FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER',
        },
        sub: {
          taskTypeId: '60f68604eeb2e252bc2afb3e',
          taskTypeCode: 'FTTC_HSI_CHANGE_SPEED_FLP_JOIN',
        },
        appointmentType: {
          type: 'appointment',
          value: '0',
          unit: 'day'
        },
      },
    });
  });

  it('should be route to zone (FTTC_HSI_CHANGE_SPEED_FLP_JOIN -> FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER) correctly - 5', async () => {
    const soa: any[] = [
      {
        attrCode: 'CHANGE_CARD_FLAG',
        attrName: 'CHANGE_CARD_FLAG',
        value: 'Y',
        valueDesc: 'Y',
      },
      {
        attrCode: 'CHANGE_MODEM_FLAG',
        attrName: 'CHANGE_MODEM_FLAG',
        value: 'Y',
        valueDesc: 'Y',
      },
    ]
    const po: any[] = [
      {
        prodEventCode: 'CHANGE_SPEED',
        product: {
          accessMode: 'FTTB',
          prodSpecCode: 'HSI',
        },
      },
    ]
    const inputG = inputGenerator(
      '60f68604eeb2e252bc2afb3e',
      'FTTC_HSI_CHANGE_SPEED_FLP_JOIN',
      'HSI',
      soa,
      po,
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'SUB_ZONE',
        zone: {
          taskTypeId: '60f68604eeb2e252bc2afb46',
          taskTypeCode: 'FTTC_HSI_CHANGE_SPEED_FLP_JOIN_JUMPER',
        },
        sub: {
          taskTypeId: '60f68604eeb2e252bc2afb3e',
          taskTypeCode: 'FTTC_HSI_CHANGE_SPEED_FLP_JOIN',
        },
        appointmentType: {
          type: 'appointment',
          value: '0',
          unit: 'day'
        },
      },
    });
  });

  it('should be route to zone (FTTC_HSI_CHANGE_SPEED_FLP_JOIN -> FTTC_HSI_CHANGE_SPEED_FLP_JOIN) correctly - 2', async () => {
    const soa: any[] = [
      {
        attrCode: 'CHANGE_CARD_FLAG',
        attrName: 'CHANGE_CARD_FLAG',
        value: 'N',
        valueDesc: 'N',
      },
      {
        attrCode: 'CHANGE_MODEM_FLAG',
        attrName: 'CHANGE_MODEM_FLAG',
        value: 'N',
        valueDesc: 'N',
      },
      {
        attrCode: 'CHANGE_SIG_FLAG',
        attrName: 'CHANGE_SIG_FLAG',
        value: 'N',
        valueDesc: 'N',
      },
    ]
    const po: any[] = [
      {
        prodEventCode: 'CHANGE_SIG',
        product: {
          accessMode: 'FTTB',
          prodSpecCode: 'HSI',
        },
      },
    ]
    const inputG = inputGenerator(
      '60f68604eeb2e252bc2afb3e',
      'FTTC_HSI_CHANGE_SPEED_FLP_JOIN',
      'HSI',
      soa,
      po,
    )
    const output = await worker.process(inputG as any);
    expect(output).toMatchObject({
      status: 'COMPLETED',
      output: {
        assignTo: 'SUB',
        sub: {
          taskTypeId: '60f68604eeb2e252bc2afb3e',
          taskTypeCode: 'FTTC_HSI_CHANGE_SPEED_FLP_JOIN',
        }
      },
    });
  });
});
