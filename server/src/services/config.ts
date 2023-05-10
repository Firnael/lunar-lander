import { z } from 'zod';
import { parseEnv } from "znv";
import dotenv from 'dotenv';

// load .env file content into 'process.env'
dotenv.config();

// create config object with validation
const config = parseEnv(process.env, {
    MONITORING_HEART_BEAT_RATE: z.number().int().positive(),
    
});

export default config;