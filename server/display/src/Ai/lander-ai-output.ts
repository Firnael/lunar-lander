import {LanderData} from "../models/lander";

export class LanderAiOutput{
    re: boolean;
    rs: boolean;
    te: boolean;
    public constructor(data: number[]) {
        this.re = this.isActivate(data[0]);
        this.rs = this.isActivate(data[1]);
        this.te = this.isActivate(data[2]);
    }

    private isActivate(value: number): boolean{
        return value > 0.5;
    }
}