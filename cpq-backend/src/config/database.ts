import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

dotenv.config(); // Load .env file

const isDevelopment = process.env.NODE_ENV === 'development';

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      models: [__dirname + "/../models"], // Path to Sequelize models
      logging: false, // Disable SQL query logging
    })
  : new Sequelize({
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      dialect: "postgres",
      dialectOptions: isDevelopment ? {} : {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      models: [__dirname + "/../models"], // Path to Sequelize models
      logging: false, // Disable SQL query logging
    });

export default sequelize;