import {
    Model,
    Table,
    Column,
    DataType,
    ForeignKey,
    BelongsTo
  } from "sequelize-typescript";
  import { ProductSupplied } from "./ProductSupplied";
  
  @Table({
    tableName: "product_supplied_serial_numbers",
    timestamps: true,
  })
  export class ProductSuppliedSerialNumber extends Model {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;
  
    @ForeignKey(() => ProductSupplied)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    productSuppliedId!: number;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    serialNumber!: string;
  
    @BelongsTo(() => ProductSupplied)
    productSupplied!: ProductSupplied;
  }