import {
    Model,
    Table,
    Column,
    DataType,
    ForeignKey,
    BelongsTo,
    HasMany
  } from "sequelize-typescript";
  import { Customer } from "./Customer";
  import { Poc } from "./Poc";
  import { User } from "./User";
  import { License } from "./License";
  import { ProductSuppliedSerialNumber } from "./ProductSuppliedSerialNumber";
  
  @Table({
    tableName: "products_supplied",
    timestamps: true,
  })
  export class ProductSupplied extends Model {
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
    productId!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    productName!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    brand!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    sku!: string;
    
    @ForeignKey(() => Customer)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    customerId!: number;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    customerName!: string;
  
    @ForeignKey(() => Poc)
    @Column({
      type: DataType.INTEGER,
      allowNull: true,
    })
    pocId!: number | null;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    pocName!: string;
  
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
      type: DataType.INTEGER,
      allowNull: false,
      defaultValue: 1,
    })
    quantity!: number;
  
    @Column({
      type: DataType.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    })
    unitPrice!: number;
  
    @Column({
      type: DataType.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    })
    tax!: number;
  
    @Column({
      type: DataType.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    })
    totalAmount!: number;
  
    @Column({
      type: DataType.DATEONLY,
      allowNull: true,
    })
    supplyDate!: Date | null;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    orderInvoiceId!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
      defaultValue: 'Pending',
    })
    status!: string;
  
    @ForeignKey(() => User)
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    executiveId!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    executiveName!: string;
  
    @Column({
      type: DataType.DATEONLY,
      allowNull: true,
    })
    warrantyUpto!: Date | null;
  
    @Column({
      type: DataType.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })
    wpcLicenseRequired!: boolean;
  
    @ForeignKey(() => License)
    @Column({
      type: DataType.INTEGER,
      allowNull: true,
    })
    licenseId!: number | null;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    licenseNumber!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    companyName!: string;
  
    // Define relationships
    @BelongsTo(() => Customer)
    customer!: Customer;
  
    @BelongsTo(() => Poc)
    poc!: Poc;
  
    @BelongsTo(() => User, { foreignKey: "executiveId" })
    executive!: User;
  
    @BelongsTo(() => License)
    license!: License;
  
    @HasMany(() => ProductSuppliedSerialNumber, { onDelete: 'CASCADE', hooks: true })
    serialNumbers!: ProductSuppliedSerialNumber[];
  }