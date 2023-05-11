import { z } from 'zod';
import { parseEnv } from "znv";
import dotenv from 'dotenv';

// load .env file content into 'process.env'
dotenv.config();

// create config object with validation
const config = parseEnv(process.env, {
    // monitoring
    MONITORING_HEART_BEAT_RATE: z.number().int().positive(),
    // game
    SHIP_MAX_VELOCITY: z.number().int().positive(),
    SHIP_ACCELERATION: z.number().int().positive(),
    LANDING_MAX_ANGLE: z.number().int().positive().max(180),
    LANDING_MAX_VELOCITY_X: z.number().int().positive(),
    LANDING_MAX_VELOCITY_Y: z.number().int().positive(),
    FUEL_TANK_SIZE: z.number().int().positive(),
});

export default config;