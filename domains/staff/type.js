// @flow 

export type Staff = {
  _id: string,
  staffSkills: {
    skill: string,
    level: number,
  }[],
  userId: string,
  startWorkingHour: number,
  startWorkingMinute: number,
  citizenId: string,
  citizenIdExpired: Date,
  gender: 'male' | 'female',
  approveStatus: 'approved' | 'waiting_approve' | 'rejected',
  approveToken: string,
  submitApproveBy: string,
  submitApproveAt: Date,
  approvedAt: Date,
  birthDay: Date,
  role: string,
  team: string[],
  metaData: {
    staffCode: string,
    isActive: boolean,
    isPassTraining: boolean,
    isRequestTaxiInsurance: boolean,
    drivings: {
      drivingLicenseType:
        | 'Temporary'
        | 'Personal'
        | 'Two wheel'
        | 'Three wheel'
        | 'Four wheel'
        | 'Public'
        | 'Three wheeled Public'
        | 'Personal Motorcycle'
        | 'Motorcycle Public',
      drivingLicenseNo: string,
      drivingLicenseExpired: Date,
      licensePlate: string,
      drivingLicensePhoto: string,
    }[],
    bankAccountNumber: string,
    bankAccountProvider: string,
    bookBankAccountPhoto: string,
    formalPhoto: string,
    phoneModel: string,
    emergencyContactName: string,
    emergencyContactPhone: string,
    emergencyContactRelation: string,
  },
  referralCode: string,
  tsmReason: string,
  location: string[] | number[],
  staffId: string,
  companyId: string,
  status: 'PENDING' | 'REJECT' | 'CANCEL' | 'DONE' | 'OFFLINE' | 'ONLINE' | 'BUSY',
  company: string,
  project: string[],
  availableServices: string[],
  deliveryCriteria: {
    packageSizeId: {
      type: string,
    },
    advancePaymentId: {
      type: string,
    },
    advancePaymentValue: {
      type: number,
    },
  },
  defaultLocation: {
    coordinates: [
      number,
      number
    ],
    type: string
  },
  location: {
    type: string,
    coordinates: [
      number,
      number
    ]
  },
  phone: string,
  createdAt: string,
  updatedAt: string,
  heading: number,
  updatedBy: string,
  teamIds: string[],
  projectIds: string[],
  deleted: false,
  firstname: string,
  lastname: string,
}

export const STAFF_TYPE = {
  PART_TIME_EMPLOYEE: 'part_time_employee',
  DAILY_EMPLOYEE: 'daily_employee',
  FULL_TIME_EMPLOYEE: 'full_time_employee',
}