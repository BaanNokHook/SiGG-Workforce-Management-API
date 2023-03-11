type Latitude = number
type Longitude = number

export type Staff = {
  metaData: {
    isRequestTaxiInsurance: boolean,
    isPassTraining: boolean,
    drivings: [],
  },
  defaultLocation: { coordinates: [Longitude, Latitude], type: 'Point' },
  location: { coordinates: [Longitude, Latitude], type: 'Point' },
  teamIds: [],
  projectIds: string[],
  _id: string,
  firstname: string,
  lastname: string,
  gender: string,
  citizenId: string,
  birthDay: Date,
  referralCode: string,
  companyId: string,
  userId: string,
  staffSkills: [],
  tsmReason: string,
  updatedAt: string,
  createdAt: string,
  removeWhitelistAt: string,
  approveStatus: string,
  status: string,
  vehicles: [],
}

export type StaffsOrderTickets = {  
  _id: string,  
  deleted: boolean, 
  orderId: string,  
  orderTicket: string, 
  location: {
      lat: number,  
      lng: number,  
  },  
  staffsInfo: StaffInfo,  
  companyId: string, 
  projectId: string,  
  createdAt: string,  
  updatedAt: string,  
  __v: number,  
}

type StaffInfo = {
   staffId: string, 
   userId: string, 
}