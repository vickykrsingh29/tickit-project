import { Model, Table, Column, DataType, HasMany } from "sequelize-typescript";
import { Customer } from "./Customer";
import { Product } from "./Product";
import { Quote } from "./Quote";
import { Order } from "./Order";

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  id!: string; // Auth0 `sub` claim

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  designation?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  companyName?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  teamName?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  approvalByAdmin!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "user",
  })
  role!: string;

  @HasMany(() => Customer)
  customers!: Customer[];

  @HasMany(() => Product)
  products!: Product[];

  @HasMany(() => Quote)
  quotes!: Quote[];
  
  @HasMany(() => Order)
  orders!: Order[];
}