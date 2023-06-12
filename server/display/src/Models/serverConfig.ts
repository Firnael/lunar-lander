/**
 * Needs to be updated when the server config is updated
 */
export interface ServerConfig {
    SIMULATION_DATA_HEART_BEAT_RATE: number;
    MONITORING_HEART_BEAT_RATE: number;
    SHIP_MAX_VELOCITY: number;
    SHIP_ACCELERATION: number;
    USE_ANGULAR_ACCELERATION: boolean;
    SHIP_ANGULAR_ACCELERATION: number;
    SHIP_ANGULAR_VELOCITY: number;
    LANDING_MAX_ANGLE: number;
    LANDING_MAX_VELOCITY_X: number;
    LANDING_MAX_VELOCITY_Y: number;
    FUEL_TANK_SIZE: number;
    DANGER_ZONE_HEIGHT: number;
};