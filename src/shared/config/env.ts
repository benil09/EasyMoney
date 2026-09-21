import dotenv from 'dotenv'

dotenv.config();

export const Port = process.env.PORT || 8000;
export const DB_URL = process.env.DATABASE_URL || 8000;