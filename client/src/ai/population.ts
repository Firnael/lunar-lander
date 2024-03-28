import {GeneticSystem} from "./genetic-system";

export class Population {
    private system: GeneticSystem[];
    private modelNbIn: number;
    private modelNbHidden: number[];
    private modelNbOut: number;

    constructor(taillePopulation: number, init: boolean) {
        this.system = [];

        this.modelNbIn = 7;
        this.modelNbHidden = [16, 8];
        this.modelNbOut = 3;

        if (init) {
            for (let i = 0; i < taillePopulation; i++) {
                const genom: number[] = new Array(this.getLengthGenom());
                for (let gene = 0; gene < genom.length; gene++) {
                    genom[gene] = Math.random() * 2.0 - 1.0;
                }
                const gs: GeneticSystem = new GeneticSystem(genom);
                this.setGeneticSystem(i, gs);
            }
        }
    }

    public getGeneticSystem(index: number): GeneticSystem {
        return this.system[index];
    }

    public setGeneticSystem(index: number, gs: GeneticSystem): void {
        this.system[index] = gs;
    }

    public taillePopulation(): number {
        return this.system.length;
    }

    private getLengthGenom(): number {
        let length: number = 0;

        for (let layer = 0; layer < this.modelNbHidden.length; layer++) {
            if (layer === 0) {
                length += (this.modelNbIn + 1) * this.modelNbHidden[layer];
            } else {
                length += (this.modelNbHidden[layer - 1] + 1) * this.modelNbHidden[layer];
            }
        }

        length += (this.modelNbHidden[this.modelNbHidden.length - 1] + 1) * this.modelNbOut;
        return length;
    }

    public getFittest(): GeneticSystem {
        let fittest: GeneticSystem = this.getGeneticSystem(0);
        for (let i = 0; i < this.taillePopulation(); i++) {
            if (fittest.getFittest() <= this.getGeneticSystem(i).getFittest()) {
                fittest = this.getGeneticSystem(i);
            }
        }
        return fittest;
    }
}