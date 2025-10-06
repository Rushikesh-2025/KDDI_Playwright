// env.config.ts
import * as dotenv from "dotenv";

// Load the environment-specific .env file
/* dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`
}); */

// Load environment variables from .env
dotenv.config();
export const EnvConfig = {
  baseURL: process.env.APP_URL || "https://external.dev.kddi-fs.veritrans.jp/portal" || "",
  Transation_baseURL: process.env.APP_URL || "https://external.dev.kddi-fs.veritrans.jp/portal",
  email: process.env.EMAIL || "rushikesh.dgft@gmail.com",
  password: process.env.PASSWORD || "Password@123",

  // add more variables here as needed
};