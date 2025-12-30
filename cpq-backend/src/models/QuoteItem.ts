import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo // Import BelongsTo
} from "sequelize-typescript";
import { Quote } from "./Quote";

@Table({ tableName: "quote_items" })
export class QuoteItem extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => Quote)
  @Column({ type: DataType.INTEGER, allowNull: false })
  quoteId!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  productName!: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  unitPrice!: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  tax!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  quantity!: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  discount!: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  amount!: number;

  @Column({ type: DataType.STRING, allowNull: true })
  batchNo?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  unit?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  itemCategory?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  itemCode?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  modelNo?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  serialNo?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  size?: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  expDate?: Date;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  mfgDate?: Date;

  @BelongsTo(() => Quote) // Add this to define the BelongsTo association
  quote!: Quote;
}