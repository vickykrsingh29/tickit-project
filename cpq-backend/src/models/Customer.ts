import { Model, Table, Column, DataType, ForeignKey, HasMany, AllowNull} from "sequelize-typescript";
import { User } from "./User";
import { Quote } from "./Quote";
import { STRING } from "sequelize";
import { Poc } from "./Poc";
import { Order } from "./Order";

@Table({
  tableName: "customers",
  timestamps: true, // Adds createdAt and updatedAt columns
})
export class Customer extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;
 
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;
 
// A
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  website!: string;
 
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  ancillaryName!: string;
 
  @Column({
    type: DataType.JSONB,  // Stores JSON data efficiently
    allowNull: true,
  })
  socialHandles!: Record<string, string>;
 
 
 
  @Column({
    type: STRING,
    allowNull: false,
    defaultValue : "",
  })
  typeOfCustomer!: string;
 
  @Column({
    type: STRING,
    allowNull: true,
  })
  companyName!: string;


  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string;
 
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone!: string;
 
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  industry!: string;
 
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  gstNumber!: string;
 
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  salesRep!: string;
 
  @Column({
    type: DataType.ARRAY(DataType.TEXT),
    allowNull: true,
  })
  quoteHistory!: string[];
 
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  billingStreetAddress!: string;
 
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
    type: DataType.STRING,
    allowNull: true,
  })
  shippingStreetAddress!: string;
 
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
    defaultValue: true,
  })
  sameAsBilling!: boolean;
 
  // A
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  wpcStreetAddress!: string;
 
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
    defaultValue: true,
  })
  wpcSameAsBilling!: boolean;
 
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
    defaultValue: [],
  })
  images!: string[];
 
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId!: string;
 
  @HasMany(() => Quote, { onDelete: 'CASCADE', hooks: true })
  quotes!: Quote[];
 
  @HasMany(() => Poc, { onDelete: 'CASCADE', hooks: true })
  pocs!: Poc[];
  
  @HasMany(() => Order, { onDelete: 'CASCADE', hooks: true })
  orders!: Order[];
}