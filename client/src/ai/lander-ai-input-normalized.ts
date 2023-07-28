import {LanderData} from "../models/lander";

export class LanderAiInputNormalized {
    vx: number;
    vxpn: number;
    vy: number;
    vypn: number
    an: number;
    pn: number;
    al: number;
    public constructor(data: LanderData) {
        this.vx = this.normalize(Math.abs(data.vx), 40);
        this.vxpn = data.vx > 0 ? 1 : 0;
        this.vy = this.normalize(Math.abs(data.vy), 40);
        this.vypn = data.vy > 0 ? 1 : 0;
        this.an = this.normalize(Math.abs(data.angle), 10);
        this.pn = data.angle > 0 ? 1 : 0;
        this.al = this.normalize(data.altitude, 20);
    }

    private normalize(value: number, pivot: number): number{
        return (1/pivot * value) / (1 + (1/pivot * value));
    }

    toArray() {
        return [
            this.vx,
            this.vxpn,
            this.vy,
            this.vypn,
            this.an,
            this.pn,
            this.al
        ];
    }
}