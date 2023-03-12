import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  CanCancel,
  IAdditionalDevice,
  IAppointmentTime,
  ICancelOrder,
  ICancelOrderParams,
  IContact,
  ICreateOrderRequest,
  ICreateOrderResponse,
  ICustomer,
  IGetOrderInformationParams,
  IInquiry,
  IListOrdersAllowToCancelResponse,
  IOrderAttribute,
  IOrderInformation as IOrderInfo,
  IProduct,
  IProductAttribute,
  IProductOrder,
  IRelationProduct,
  IRelationProductOrder,
  IServiceOrderAttribute,
  IServiceOrderInfo,
  ISpecialAP,
  ISubProduct,
  IWFMOrderResponse,
} from '../../../../../domains/installation/order.interface';

// ***** create and update *****
export class CreateOrderResponse implements ICreateOrderResponse {
  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  @IsString()
  @IsNotEmpty()
  resultCode!: string;

  @IsString()
  @IsNotEmpty()
  resultDesc!: string;
}

class Customer implements ICustomer {
  @IsString()
  @IsOptional()
  custId?: string | undefined;

  @IsString()
  @IsNotEmpty()
  custName!: string;

  @IsString()
  @IsNotEmpty()
  custType!: string;

  @IsString()
  @IsOptional()
  addressDetails?: string | undefined;

  @ValidateNested()
  @IsOptional()
  @Type(() => Contact)
  contact?: Contact | undefined;
}

class ServiceOrderInfo implements IServiceOrderInfo {
  @IsString()
  @IsNotEmpty()
  createDate!: string;

  @IsString()
  @IsOptional()
  submitOrgName?: string | undefined;

  @IsString()
  @IsOptional()
  submitStaffCode?: string | undefined;

  @IsString()
  @IsOptional()
  submitStaffName?: string | undefined;

  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => Customer)
  customer!: Customer;

  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => ServiceOrderAttribute)
  serviceOrderAttribute!: ServiceOrderAttribute[];

  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => ProductOrder)
  productOrderList!: ProductOrder[];

  @IsOptional()
  certificate?: any;
}

export class CreateOrderRequest implements ICreateOrderRequest {
  @IsString()
  @IsNotEmpty()
  requestNo!: string;

  @IsString()
  @IsNotEmpty()
  serviceOrderNo!: string;

  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => ServiceOrderInfo)
  serviceOrderInfo!: ServiceOrderInfo;
}

// ***** cancel *****
export class ICancelOrderInquiryRequest {
  @IsString()
  @IsNotEmpty()
  orderNoSet!: string;
}

class CanCancelInquiryResult implements IInquiry {
  @IsNotEmpty()
  @IsString()
  orderNo!: IInquiry['orderNo'];

  @IsString()
  cannotReason?: IInquiry['cannotReason'];

  @IsNotEmpty()
  @IsEnum(CanCancel)
  canCancel!: IInquiry['canCancel'];
}

export class ICancelOrderInquiryResponse
  implements IListOrdersAllowToCancelResponse {
  @IsString()
  @IsNotEmpty()
  resultCode!: IListOrdersAllowToCancelResponse['resultCode'];

  @IsString()
  @IsNotEmpty()
  resultDesc!: IListOrdersAllowToCancelResponse['resultDesc'];

  @ValidateNested({ each: true })
  @Type(() => CanCancelInquiryResult)
  @ArrayNotEmpty()
  inquiryResult!: CanCancelInquiryResult[];
}

export class IGetOrderInformationRequest implements IGetOrderInformationParams {
  @IsString()
  custOrderNo!: string;
}

export class ICancelOrderRequest implements ICancelOrderParams {
  @IsString()
  @IsOptional()
  userName?: ICancelOrderParams['userName'];

  @IsString()
  @IsOptional()
  userCode?: ICancelOrderParams['userCode'];

  @IsString()
  @IsNotEmpty()
  systemId!: ICancelOrderParams['systemId'];

  @IsString()
  @IsNotEmpty()
  operDate!: ICancelOrderParams['operDate'];

  @IsString()
  @IsNotEmpty()
  serviceOrderNo!: ICancelOrderParams['serviceOrderNo'];

  @IsString()
  @IsNotEmpty()
  cancelReason!: ICancelOrderParams['cancelReason'];
}

export class ICancelOrderResponse implements ICancelOrder {
  @IsString()
  @IsNotEmpty()
  transactionId!: ICancelOrder['transactionId'];

  @IsString()
  @IsNotEmpty()
  resultCode!: ICancelOrder['resultCode'];

  @IsString()
  @IsNotEmpty()
  resultDesc!: ICancelOrder['resultDesc'];
}

export class IOrderInformation implements IOrderInfo {
  @IsString()
  @MaxLength(32)
  workOrderNo!: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  woCreateTime?: string;

  @IsString()
  @MaxLength(32)
  @IsOptional()
  operStat?: string;

  @IsString()
  @IsOptional()
  appointmentTimeSlot?: IAppointmentTime;

  @IsString()
  @MaxLength(32)
  @IsOptional()
  confirmedCMPLTime?: string;

  @IsString()
  @MaxLength(32)
  @IsOptional()
  confirmedBGTime?: string;

  @IsString()
  @MaxLength(32)
  @IsOptional()
  subcontractorName?: string;

  @IsString()
  @MaxLength(32)
  @IsOptional()
  teamName?: string;

  @IsString()
  @MaxLength(32)
  @IsOptional()
  handlerName?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  rejectReasonTH?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  rejectReasonEN?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  returnReasonTH?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  returnReasonEN?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  rejectRemark?: string;
}

export class IGetOrderInfomation implements IWFMOrderResponse<IOrderInfo[]> {
  @ValidateNested()
  @IsArray()
  workOrderList!: IOrderInformation[];

  @IsString()
  @MaxLength(32)
  resultCode!: string;

  @IsString()
  @MaxLength(500)
  resultDesc!: string;
}

class Product implements IProduct {
  @IsString()
  @IsNotEmpty()
  areaCode!: string;

  @IsString()
  @IsOptional()
  serviceGrade?: string | undefined;

  @IsString()
  @IsNotEmpty()
  serviceNo!: string;

  @IsString()
  @IsOptional()
  oldServiceNo?: string | undefined;

  @IsString()
  @IsOptional()
  servicePassword?: string | undefined;

  @IsString()
  @IsNotEmpty()
  prodInstId!: string;

  @IsString()
  @IsOptional()
  accessMode?: string | undefined;

  @IsString()
  @IsNotEmpty()
  prodSpecCode!: string;

  @IsString()
  @IsOptional()
  bundleInstName?: string | undefined;

  @IsString()
  @IsOptional()
  addressDetails?: string | undefined;

  @IsString()
  @IsOptional()
  addressId?: string | undefined;

  @ValidateNested()
  @IsOptional()
  @Type(() => Contact)
  contact?: Contact | undefined;

  @ValidateNested()
  @IsOptional()
  @Type(() => Contact)
  contact2?: Contact | undefined;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => ProductAttribute)
  prodAttrList?: ProductAttribute[] | undefined;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => SubProduct)
  subProdList?: SubProduct[] | undefined;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => AdditionalDevice)
  additionalDevice?: AdditionalDevice[] | undefined;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => SpecialAP)
  specialAP?: SpecialAP[] | undefined;
}

class ProductOrder implements IProductOrder {
  @IsString()
  @IsNotEmpty()
  prodOrderNo!: string;

  @IsString()
  @IsNotEmpty()
  prodEventCode!: string;

  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => Product)
  product!: Product;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => RelationProductOrder)
  relaProdOrderList?: RelationProductOrder[] | undefined;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => RelationProduct)
  relaProdList?: RelationProduct[] | undefined;

  @IsString()
  @IsOptional()
  appointNo?: string | undefined;

  @IsString()
  @IsOptional()
  appointDate?: string | undefined;

  @IsString()
  @IsOptional()
  appointTime?: string | undefined;

  @IsString()
  @IsOptional()
  custRfsDate?: string | undefined;

  @IsString()
  @IsOptional()
  rfsDate?: string | undefined;

  @IsString()
  @IsOptional()
  comments?: string | undefined;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => OrderAttribute)
  ordAttrList?: OrderAttribute[] | undefined;
}

class ServiceOrderAttribute implements IServiceOrderAttribute {
  @IsString()
  @IsNotEmpty()
  attrCode!: string;

  @IsString()
  @IsNotEmpty()
  attrName!: string;

  @IsString()
  @IsOptional()
  value?: string | undefined;

  @IsString()
  @IsOptional()
  valueDesc?: string | undefined;
}

class Contact implements IContact {
  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  contactPhone_2?: string;

  @IsString()
  @IsOptional()
  contactMobile?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactName2?: string;

  @IsString()
  @IsOptional()
  contactPhone2?: string;

  @IsString()
  @IsOptional()
  contactPhone2_2?: string;

  @IsString()
  @IsOptional()
  contactMobile2?: string;

  @IsString()
  @IsOptional()
  contactEmail2?: string;
}

class SpecialAP implements ISpecialAP {
  @IsString()
  @IsNotEmpty()
  templateId!: string;

  @IsString()
  @IsNotEmpty()
  deviceCode!: string;

  @IsString()
  @IsNotEmpty()
  deviceName!: string;

  @IsString()
  @IsNotEmpty()
  isMandatory!: string;

  @IsString()
  @IsNotEmpty()
  sellType!: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;
}

class AdditionalDevice implements IAdditionalDevice {
  @IsString()
  @IsNotEmpty()
  deviceType!: string;

  @IsString()
  @IsNotEmpty()
  action!: string;

  @IsString()
  @IsNotEmpty()
  deviceName!: string;

  @IsString()
  @IsNotEmpty()
  quantity!: string;

  @IsString()
  @IsNotEmpty()
  assetType!: string;

  @IsString()
  @IsNotEmpty()
  asset!: string;
}

class SubProduct implements ISubProduct {
  @IsString()
  @IsNotEmpty()
  prodInstId!: string;

  @IsString()
  @IsNotEmpty()
  prodSpecCode!: string;

  @IsString()
  @IsNotEmpty()
  operationType!: string;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => ProductAttribute)
  prodAttrList?: ProductAttribute[] | undefined;
}

class ProductAttribute implements IProductAttribute {
  @IsString()
  @IsNotEmpty()
  attrCode!: string;

  @IsString()
  @IsNotEmpty()
  attrName!: string;

  @IsString()
  @IsOptional()
  value?: string | undefined;

  @IsString()
  @IsOptional()
  valueDesc?: string | undefined;
}

class RelationProductOrder implements IRelationProductOrder {
  @IsString()
  @IsNotEmpty()
  relaType!: string;

  @IsString()
  @IsNotEmpty()
  relaProdOrderNo!: string;
}

class RelationProduct implements IRelationProduct {
  @IsString()
  @IsNotEmpty()
  relaType!: string;

  @IsString()
  @IsNotEmpty()
  relaProdInstId!: string;
}

class OrderAttribute implements IOrderAttribute {
  @IsString()
  @IsNotEmpty()
  attrCode!: string;

  @IsString()
  @IsNotEmpty()
  attrName!: string;

  @IsString()
  @IsOptional()
  value?: string | undefined;

  @IsString()
  @IsOptional()
  valueDesc?: string | undefined;
}
