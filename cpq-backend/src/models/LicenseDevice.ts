import {
    Model,
    Table,
    Column,
    DataType,
    ForeignKey,
    BelongsTo
  } from "sequelize-typescript";
  import { License } from "./License";
  
  @Table({
    tableName: "license_devices",
    timestamps: true,
  })
  export class LicenseDevice extends Model {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;
  
    @ForeignKey(() => License)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    licenseId!: number;
  
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
      allowNull: false,
    })
    frequencyRange!: string;
  
    @Column({
      type: DataType.FLOAT,
      allowNull: false,
    })
    powerOutput!: number;
  
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    quantityApproved!: number;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    countryOfOrigin?: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    equipmentType!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    technologyUsed?: string;
  
    @BelongsTo(() => License)
    license!: License;
  }