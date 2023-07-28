import {NeuralNetwork} from "./neural-network";

export class GeneticSystem {
    private genes: number[];
    private score: number;

    constructor(genes: number[]) {
        this.genes = genes;
        this.score = 0;
    }

    getGene(index: number): number {
        return this.genes[index];
    }

    length(): number {
        return this.genes.length;
    }

    setGeneAt(index: number, value: number): void {
        this.genes[index] = value;
    }

    getFittest(): number {
        return this.score;
    }

    addScore(value: number): void{
        this.score += value;
    }

    resetScore() {
        this.score = 0;
    }
}