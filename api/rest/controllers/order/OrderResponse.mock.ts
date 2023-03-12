export default {
  metaInformation: {
    baseInformation: {
      requestNo: '20200512213959923142',
      appointmentNo: '02341eaf-3e3d-4b98-a31f-2bae98ced738',
      appointmentTime: '2018-10-22 17:00:00',
      taskTypeName: 'Task Type Name',
      standardTimeLength: '60',
      createUser: 'TRUE_CFM',
      createTime: '2020-06-09 15:32:41',
      deadline: '2020-06-10 18:00:00',
    },
    areaInformation: {
      areaName: 'Bang na',
      areaCode: '1212312121',
      mapView: '-',
      buildingId: 'N/A',
      buildingName: 'N/A',
      address:
        '[QUEUE:A] 99/36, ถ.นิมิตใหม่, มีนบุรี, มีนบุรี, กรุงเทพมหานคร, 10510',
    },
    serviceInformation: [
      {
        serviceNo: '9606260765',
        serviceName: '74-Fiber To Home',
        accessType: 'HSI',
      },
      {
        serviceNo: '021110735',
        serviceName: '74-Fiber To Home',
        accessType: 'FLP',
      },
      {
        serviceNo: '108458907',
        serviceName: '74-Fiber To Home',
        accessType: 'DSLB',
      },
    ],
    workOrderInformation: {
      workOrderNumber: '357a4e10-a97f-11ea-9bf9-1d7313bbf8a4-1',
      networkCatalog: '74-Fiber To Home',
      serviceType: 'Connectได้แต่มีปัญหา',
      requestType: 'Customer Complain',
      serviceInformation: [
        {
          serviceNo: '9606260765',
          serviceName: '74-Fiber To Home',
          accessType: 'HSI',
        },
        {
          serviceNo: '021110735',
          serviceName: '74-Fiber To Home',
          accessType: 'FLP',
        },
        {
          serviceNo: '108458907',
          serviceName: '74-Fiber To Home',
          accessType: 'DSLB',
        },
      ],
    },
    orderBaseInformation: {
      summary:
        '9610010312,FTTH, อาการ Connectได้แต่มีปัญหา, Solution: 032-ไฟ PON ไม่ติด /ไฟ LOS สีแดง',
      description: 'N/A',
      priority: 'Medium',
      planFinishTime: '2020-06-10 17:00:00', //มาจากค่า (standardTimeLength + travelingTime) จุดที่ 1 แก้ไขเวลา + optimise traveling time ตัวอย่างนี้บวกเข้าไปแล้ว 120minute
      planStartTime: '2020-06-10 14:00:00', // ปลาทองเพิ่มขี้นมาตอน optimize *เป็นเวลาที่เริ่มไปบ้านลูกค้า
      travelingTime: '120', // ปลาทองเพิ่มขี้นมาตอน optimiz
      alarmID: 'N/A',
      address:
        '[QUEUE:A] 99/36, ถ.นิมิตใหม่, มีนบุรี, มีนบุรี, กรุงเทพมหานคร, 10510',
      location: {
        latitude: '13.837566',
        longitude: '100.733368',
      },
      suggest: [
        'Media:GPON',
        'LoID:1804019135',
        'Package:null',
        'OrgBrief:AREA',
        'AppointNO:',
        'WorkOrderNO:',
        'AddressID:231027688',
        'AreaCD:101701040000',
        'SiteName:BKK17001',
        'OdfNo:NTB04X1DV2K',
        'DwellingType:A - Sub install with dropwire : OUTDOOR TEMINAL',
        'DropWire:1.0',
        'Ban:200060391',
        'WfmSystem:WFM',
        'Function:null',
        'Installed Onu:null',
        'Supported Onu:ZTE',
        'PreferAppointDate:null',
        'Priceplan Speed:1G/100M',
        'Shuffle Speed:null',
        'Vas Speed:null',
        'Radius Speed:1G/100M',
      ],
      areaCode: '1212312121',
      areaName: 'Bang Na',
      deadLine: '2020-06-10 18:00:00',
      appointmentTime: '2020-06-10 17:00:00',
    },
    customerInformation: {
      customerName: 'Test Migrate',
      identificationType: 'N/A',
      identificationNo: 'N/A',
      grade: 'N/A',
    },
    contactInformation: {
      contactName: 'คุณ เกาะกูด แสมสาร', // คือ contactName
      contactMobile: '0896697100', // คือ contactMobile1
      contactEmail: 'craynei@gmail.com', // คือ contactEmail
      contactName2: '', // ถ้ามี contactName2
      contactMobile2: '', // ถ้ามี contactMobile2
    },
    extraInformation: {
      queue: 'R',
      networkCatalog: 'name of network type',
      rcu: 'BKK17001G00',
      cab: 'BKK17X0604K:1/1',
      dp: 'BKK17X0604L:1/7',
      dw: '', // คือ distDw
      shelf: '', // หาย *มี
      slot: '',
      port: '',
      card: '',
      bbShelf: '',
      bbPort: '',
      bbSlot: '',
      bbClliCode: '', // คือ bbNetworkClliCD
      bbCleiCode: '', // คือ bbEquipmentClliCD
      voiceRack: '', // คือ voRack
      dpPair: '', // คือ dpPair
      pc: '', // คือ pcCD
      sp: '', // คือ scCD
      rcuCab: '', // คือ distRcuCab
      cabDp: '', // คือ distCabDp
      dpLocation: '',
      splitterL1: 'BKK17X0604K',
      splitterL2: 'BKK17X0604L',
      media: 'GPON',
      loID: '1804019135', // คือ ticketInfo.param
      package: '', // คือ ticketInfo.package
      ss: 0, // คือ ssQty
      rr: 0, // คือ rrQty
      relatedAsset: '', // คือ cfmTucProductVcareResponseBean
      mobile1: '', // คือ contactMobile1
      mobile2: '', // คือ contactMobile2
    },
    alarmInformation: {
      alarmId: '',
      alarmName: '',
      sourceId: '',
    },
  },
};
