import { Model, Table, Column, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { Customer } from "./Customer";
import { Order } from "./Order";

@Table({
  tableName: "pocs",
  timestamps: true, // Adds createdAt and updatedAt columns
})
export class Poc extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false, // Required field
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false, // Required field
  })
  designation!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false, // Required field
  })
  department!: string;

  @Column({
    type: DataType.JSONB, // Stores JSON data efficiently
    allowNull: true,
  })
  socialHandles!: Record<string, string>;

  @Column({
    type: DataType.STRING,
    allowNull: false, // Required field
  })
  phone!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false, // Required field
  })
  email!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  remarks!: string;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  customerId!: number;

  // Explicitly defining the alias for the relationship
  @BelongsTo(() => Customer, {
    foreignKey: "customerId",
    as: "customer", // Defines alias
  })
  customer!: Customer;
  
  @HasMany(() => Order, {
    foreignKey: "pocId",
  })
  orders!: Order[];
}
