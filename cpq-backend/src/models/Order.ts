import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo,
  Unique,
  AllowNull
} from "sequelize-typescript";
import { User } from "./User";
import { Customer } from "./Customer";
import { Poc } from "./Poc";
import { OrderItem } from "./OrderItem";

@Table({
  tableName: "orders",
  timestamps: true,
})
export class Order extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  orderNumber!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  orderName!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  orderDate!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "Pending",
  })
  orderStatus!: string;

  // Financial information - these can be calculated from OrderItems
  // but storing them here improves query performance
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  subtotal!: number; // Sum of all items before tax and discount

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  taxAmount!: number; // Total tax amount

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  discountAmount!: number; // Total discount amount

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  totalAmount!: number; // Final amount after tax and discount

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  orderRemarks!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentTerms!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentMethod!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  deliveryMethod!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expectedDeliveryDate!: string;

  // Store addresses as strings instead of JSONB to avoid casting issues
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: "",
  })
  billingAddress!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  billingAddressLine2!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  billingPin!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  billingCity!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  billingDistrict!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  billingState!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  billingCountry!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: "",
  })
  shippingAddress!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  shippingAddressLine2!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  shippingPin!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  shippingCity!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  shippingDistrict!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  shippingState!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  shippingCountry!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  sameAsBilling!: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  wpcAddress!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  wpcAddressLine2!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  wpcPin!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  wpcCity!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  wpcDistrict!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  wpcState!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  wpcCountry!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  wpcSameAsBilling!: boolean;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: [],
  })
  attachments!: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: [],
  })
  documents!: string[];

  // Additional fields from OrderDetailView
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  executiveName!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  deliveryInstruction!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  modeOfDispatch!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  warranty!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  requiresLicense!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  licenseType!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  licenseNumber!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  licenseExpiryDate!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  licenseIssueDate!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  licenseQuantity!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  liaisoningRemarks!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  liaisoningVerified!: boolean;

  // Additional Cost Fields
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  liquidatedDamagesInclusive!: boolean;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  liquidatedDamagesAmount!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  freightChargeInclusive!: boolean;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  freightChargeAmount!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  transitInsuranceInclusive!: boolean;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  transitInsuranceAmount!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  installationInclusive!: boolean;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  installationAmount!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  securityDepositInclusive!: boolean;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  securityDepositAmount!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  liaisoningInclusive!: boolean;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  liaisoningAmount!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  additionalCostTotal!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  grandTotal!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  performanceBankGuarantee!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  licenseStatus!: string; // "No license, need to apply new", "Yes license, no issues", "Yes license, but need to apply for additional"

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  licenseVerified!: boolean; // "I verify that the license details are correct and the order is approved from the liasoning department"

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId!: string;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  customerId!: number;

  @ForeignKey(() => Poc)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  pocId!: number;


  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  createdBy!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  updatedBy!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  pendingApprovalBy?: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  approvedBy?: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  companyName!: string;

  // Add customerName field
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  customerName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentTerm!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  orderCreationDate!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  customerGST!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  customerEmail!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  customerPhone!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  pocName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  pocEmail!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  pocPhone!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  pocDesignation!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  pocDepartment!: string;

  // Relationships
  @BelongsTo(() => User, {
    foreignKey: "userId",
  })
  user!: User;

  @BelongsTo(() => Customer, {
    foreignKey: "customerId",
    as: "customer",
  })
  customer!: Customer;

  @BelongsTo(() => Poc, {
    foreignKey: "pocId",
    as: "poc",
  })
  poc!: Poc;

  @BelongsTo(() => User, {
    foreignKey: "updatedBy",
    as: "Updater",
  })
  Updater?: User;

  @HasMany(() => OrderItem, { onDelete: "CASCADE", hooks: true })
  items!: OrderItem[];

  get additionalCost() {
    return {
      liquidatedDamages: {
        inclusive: this.liquidatedDamagesInclusive,
        amount: this.liquidatedDamagesAmount
      },
      freightCharge: {
        inclusive: this.freightChargeInclusive,
        amount: this.freightChargeAmount
      },
      transitInsurance: {
        inclusive: this.transitInsuranceInclusive,
        amount: this.transitInsuranceAmount
      },
      installation: {
        inclusive: this.installationInclusive,
        amount: this.installationAmount
      },
      securityDeposit: {
        inclusive: this.securityDepositInclusive,
        amount: this.securityDepositAmount
      },
      liaisoning: {
        inclusive: this.liaisoningInclusive,
        amount: this.liaisoningAmount
      },
    };
  }
}