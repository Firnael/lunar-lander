import {GeneticSystem} from "./genetic-system";

export class Neuron{
    private weights: number[];
    private nbInputs: number;

    private output: number;

    public getOutput(): number {
        return this.output;
    }

    public weight(index: number): number{
        return this.weights[index];
    }

    public nbWeight(): number{
        return this.weights.length;
    }

    public adjustWeight(index: number, value: number): void{
        this.weights[index] = value;
    }

    public constructor(nbInputs: number, geneticSystem?: GeneticSystem, start?: number) {
        this.nbInputs = nbInputs - 1;
        this.output = Number.NaN;
        this.weights = [];

        for(let i = 0; i < nbInputs; i++){
            if(geneticSystem && start !== undefined){
                this.weights[i] = geneticSystem.getGene(i + start);
            }else{
                this.weights[i] = Math.random() * 2.0 - 1.0;
            }
        }
    }

    public evaluate(inputs: number[]): number{
        if(Number.isNaN(this.output)){
            let x = 0.0;
            for(let i = 0; i < this.nbInputs; i++){
                x += inputs[i] * this.weights[i];
            }
            x += this.weights[this.nbInputs];

            this.output = 1 / (1.0 + Math.exp(-1.0 * x));
        }
        return this.output;
    }
    public clear(): void{
        this.output = Number.NaN;
    }

}