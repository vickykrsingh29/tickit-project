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
  import { LicenseDevice } from "./LicenseDevice";
  
  @Table({
    tableName: "licenses",
    timestamps: true,
  })
  export class License extends Model {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id!: number;
  
    // Basic License Details
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    licenseNumber!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    licenseType!: string;
  
    @Column({
      type: DataType.DATEONLY,
      allowNull: false,
    })
    issuingDate!: string;
  
    @Column({
      type: DataType.DATEONLY,
      allowNull: false,
    })
    expiryDate!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    status!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    issuingAuthority!: string;
  
    // Company association field - important for filtering by company
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    companyName!: string;
  
    @ForeignKey(() => User)
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    processedBy!: string;
  
    // Customer Details
    @ForeignKey(() => Customer)
    @Column({
      type: DataType.INTEGER,
      allowNull: false,
    })
    companyId!: number;
  
  
    // WPC License Address
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    wpcStreetAddress!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    wpcAddressLine2?: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    wpcPin?: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    wpcCity?: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    wpcDistrict?: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    wpcState?: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    wpcCountry?: string;
  
    // Contact Person Details
    @ForeignKey(() => Poc)
    @Column({
      type: DataType.INTEGER,
      allowNull: true,
    })
    contactPersonId?: number;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    contactPersonName?: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    contactPersonNumber?: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    contactPersonEmailId?: string;
  
    // Operational Details
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    geographicalCoverage!: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    endUsePurpose!: string;
  
    // Document URLs
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    licenseDocumentUrl?: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    etaCertificateUrl?: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    importLicenseUrl?: string;
  
    @Column({
      type: DataType.ARRAY(DataType.STRING),
      allowNull: true,
      defaultValue: [],
    })
    otherDocumentsUrls?: string[];
  
    @ForeignKey(() => User)
    @Column({
      type: DataType.STRING,
      allowNull: false,
    })
    createdBy!: string;
    
    @Column({
      type: DataType.STRING,
      allowNull: true,
    })
    lastUpdatedBy?: string;
  
    // Company association
    @BelongsTo(() => Customer)
    customer!: Customer;
  
    // POC association
    @BelongsTo(() => Poc, { foreignKey: 'contactPersonId', as: 'contactPerson' })
    contactPerson?: Poc;
  
    // User association (processed by)
    @BelongsTo(() => User)
    processor?: User;
  
    // Device details association
    @HasMany(() => LicenseDevice)
    devices!: LicenseDevice[];
  }