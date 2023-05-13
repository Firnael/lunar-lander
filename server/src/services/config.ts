import { z } from 'zod';
import { parseEnv } from "znv";
import dotenv from 'dotenv';

// load .env file content into 'process.env'
dotenv.config();

// create config object with validation
const config = parseEnv(process.env, {
    // network
    SIMULATION_DATA_HEART_BEAT_RATE: z.number().int().positive(),
    MONITORING_HEART_BEAT_RATE: z.number().int().positive(),
    // game
    SHIP_MAX_VELOCITY: z.number().int().positive(),
    SHIP_ACCELERATION: z.number().int().positive(),
    USE_ANGULAR_ACCELERATION: z.boolean(),
    SHIP_ANGULAR_ACCELERATION: z.number().int().positive(),
    SHIP_ANGULAR_VELOCITY: z.number().int().positive(),
    LANDING_MAX_ANGLE: z.number().int().positive().max(180),
    LANDING_MAX_VELOCITY_X: z.number().int().positive(),
    LANDING_MAX_VELOCITY_Y: z.number().int().positive(),
    FUEL_TANK_SIZE: z.number().int().positive(),
});

export default config;