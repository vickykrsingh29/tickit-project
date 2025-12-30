import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Unique,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./User"; // adjust if needed
import { QuoteItem } from "./QuoteItem";
import { Customer } from "./Customer";

@Table({ tableName: "quotes" })
export class Quote extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING, allowNull: false })
  userId!: string;

  @ForeignKey(() => Customer)
  @Column({ type: DataType.INTEGER, allowNull: false })
  customerId!: number;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  invoiceDate!: Date;

  @Unique
  @Column({ type: DataType.STRING, allowNull: false })
  refNo!: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  totalAmount!: number;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: "Drafted" })
  status!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  createdBy!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  companyName!: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
  pendingApprovalBy?: string[];

  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
  approvedBy?: string[];

  @Column({ type: DataType.STRING, allowNull: true })
  remarks?: string;

  @Column({
    type: DataType.JSONB, // Use JSONB to store an array of strings
    allowNull: true,
  })
  visibleColumns?: string[];

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING, allowNull: true })
  updatedBy?: string;

  @HasMany(() => QuoteItem, { onDelete: "CASCADE", hooks: true })
  items!: QuoteItem[];

  @BelongsTo(() => Customer, {
    foreignKey: "customerId",
    as: "customer", // Add explicit alias to match the query
  })
  customer!: Customer;

  // src/models/Quote.ts
  @BelongsTo(() => User, {
    foreignKey: "updatedBy",
    as: "Updater",
  })
  Updater?: User;
}
