import { Model, Table, Column, DataType, ForeignKey, HasMany} from "sequelize-typescript";
import { User } from "./User";
import { OrderItem } from "./OrderItem";

@Table({
  tableName: "products",
  timestamps: true,
})
export class Product extends Model {
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
  productName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  brand!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  category!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  skuId!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: [],
  })
  images!: string[];

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  pricePerPiece!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  gst!: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  priceWithGST!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  stockQuantity!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  unitOfMeasurement!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: [],
  })
  documents!: string[];

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  features!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  specifications!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  companyName!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId!: string;

  @HasMany(() => OrderItem)
  orderItems!: OrderItem[];
}