import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull
} from "sequelize-typescript";
import { Order } from "./Order";
import { Product } from "./Product";

@Table({ 
  tableName: "order_items",
  timestamps: true, // Adds createdAt and updatedAt columns
})
export class OrderItem extends Model {
  @Column({ 
    type: DataType.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  })
  id!: number;

  @ForeignKey(() => Order)
  @Column({ 
    type: DataType.INTEGER, 
    allowNull: false 
  })
  orderId!: number;

  @ForeignKey(() => Product)
  @Column({ 
    type: DataType.INTEGER, 
    allowNull: false 
  })
  productId!: number;

  @Column({ 
    type: DataType.STRING, 
    allowNull: false 
  })
  productName!: string;

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  skuId!: string;

  @Column({ 
    type: DataType.FLOAT, 
    allowNull: false 
  })
  unitPrice!: number;

  @Column({ 
    type: DataType.FLOAT, 
    allowNull: false 
  })
  taxRate!: number; // Percentage rate, not amount

  @Column({ 
    type: DataType.INTEGER, 
    allowNull: false 
  })
  quantity!: number;

  @Column({ 
    type: DataType.FLOAT, 
    allowNull: false,
    defaultValue: 0
  })
  discountRate!: number; // Percentage rate, not amount

  // These can be calculated but storing them improves query performance
  @Column({ 
    type: DataType.FLOAT, 
    allowNull: false,
    defaultValue: 0
  })
  subtotal!: number; // unitPrice * quantity

  @Column({ 
    type: DataType.FLOAT, 
    allowNull: false,
    defaultValue: 0
  })
  taxAmount!: number; // calculated tax amount

  @Column({ 
    type: DataType.FLOAT, 
    allowNull: false,
    defaultValue: 0
  })
  discountAmount!: number; // calculated discount amount

  @Column({ 
    type: DataType.FLOAT, 
    allowNull: false,
    defaultValue: 0
  })
  totalAmount!: number; // final amount after tax and discount

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  batchNo?: string;

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  unit?: string;

  @Column({ 
    type: DataType.TEXT, 
    allowNull: true 
  })
  description?: string;

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  category?: string;

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  modelNo?: string;

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  serialNo?: string;

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  size?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "Pending"
  })
  status!: string; // Can be "Pending", "In Transit", "Delivered", "Cancelled", "Returned", etc.

  @Column({
    type: DataType.DATEONLY,
    allowNull: true
  })
  deliveryDate?: Date;

  // Store product-specific details as individual columns instead of JSONB
  @Column({ 
    type: DataType.TEXT, 
    allowNull: true 
  })
  additionalDetails?: string;

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  warranty?: string;

  @Column({ 
    type: DataType.STRING, 
    allowNull: true 
  })
  manufacturer?: string;

  // Relationships
  @BelongsTo(() => Order)
  order!: Order;

  @BelongsTo(() => Product, {
    foreignKey: "productId"
  })
  product!: Product;

  // Helper method to get productDetails as a JSON object for API compatibility
  get productDetails() {
    return {
      additionalDetails: this.additionalDetails,
      warranty: this.warranty,
      manufacturer: this.manufacturer,
      batchNo: this.batchNo,
      modelNo: this.modelNo,
      serialNo: this.serialNo,
      size: this.size
    };
  }
} 