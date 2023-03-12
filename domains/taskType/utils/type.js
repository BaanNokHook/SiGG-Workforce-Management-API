// @flow
export type MetadataWorkflow = {
  taskId: string,
  taskName: string,
  taskReferenceName: string,
  workflowId: string,
  transactionId: string,
  workflowName: string,
  workflowRev: string,
}

export type MetadataWorkflows = MetadataWorkflow[]

export type UpdateTodoInput = {
  userId: string,
  lat: number,
  lng: number,
  price?: number,
  recipientName?: string,
  images?: string[],
  recipientName?: string,
}

// ********** update todo *********
export type ImagePath = {
  imgUrls: string[],
}

export type Setoff = {
  userId: string,
  lat: number,
  lng: number,
  date: Date,
}

export type Summary = {
  item: object,
  lat: number,
  lng: number,
  date: Date,
  userId: string,
  date: Date,
}

export type Receipt = {
  lat: number,
  lng: number,
  method: string,
  userId: string,
  date: Date,
}

export type CheckIn = {
  userId: string,
  lat: number,
  lng: number,
  date: Date,
}

export type PackingItems = {
  parcels: [],
  userId: string,
  lat: number,
  lng: number,
  date: Date,
}

export type TakePhoto = {
  images: string[],
  userId: string,
  lat: number,
  lng: number,
  date: Date,
}

export type ProofOfDelivery = {
  images: string[],
  userId: string,
  lat: number,
  lng: number,
  date: Date,
  recipientName: string,
  relationship?: string,
}

export type CollectCash = {
  price: number,
  userId: string,
  lat: number,
  lng: number,
  date: Date,
}

export type Delivered = {
  userId: string,
  lat: number,
  lng: number,
  date: Date,
}

export type PickedUp = {
  userId: string,
  lat: number,
  lng: number,
  date: Date,
}

export type TodoType =
  | 'SET_OFF'
  | 'CHECK_IN'
  | 'PACKING_ITEMS'
  | 'TAKE_A_PHOTO'
  | 'COLLECT_CASH'
  | 'SUMMARY'
  | 'RECEIPT'
  | 'POD'
  | 'DELIVERED'
  | 'PICKED_UP'
