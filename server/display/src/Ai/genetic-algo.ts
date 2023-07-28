import {GeneticSystem} from "./genetic-system";
import {Population} from "./population";

export class GeneticAlgo {
    private tauxMutation: number = 0.015;
    private tailleTournoi: number = 5;

    public evoluer(population: Population): Population {
        const nouvellePopulation: Population = new Population(population.taillePopulation(), false);

        let elitismOffset: number = 0;

        nouvellePopulation.setGeneticSystem(0, population.getFittest());
        elitismOffset = 1;

        for (let i = elitismOffset; i < population.taillePopulation(); i++) {
            const parent1: GeneticSystem = this.selectionTournoi(population);
            const parent2: GeneticSystem = this.selectionTournoi(population);
            const children: GeneticSystem = this.crossover(parent1, parent2);
            nouvellePopulation.setGeneticSystem(i, children);
        }

        for (let i = elitismOffset; i < nouvellePopulation.taillePopulation(); i++) {
            this.muter(nouvellePopulation.getGeneticSystem(i));
        }

        return nouvellePopulation;
    }

    public crossover(parent1: GeneticSystem, parent2: GeneticSystem): GeneticSystem {
        const children: GeneticSystem = new GeneticSystem([]);


        const startPos: number = Math.floor(Math.random() * parent1.length());
        const endPos: number = Math.floor(Math.random() * parent1.length());

        for (let i = 0; i < parent1.length(); i++) {
            if (startPos < endPos && i > startPos && i < endPos) {
                children.setGeneAt(i, parent1.getGene(i));
            } else if (startPos > endPos && !(i < startPos && i > endPos)) {
                children.setGeneAt(i, parent1.getGene(i));
            } else {
                children.setGeneAt(i, parent2.getGene(i));
            }
        }

        return children;
    }

    public muter(system: GeneticSystem): void {
        for (let pos = 0; pos < system.length(); pos++) {
            if (Math.random() < this.tauxMutation) {
                system.setGeneAt(pos, (system.getGene(pos) + Math.random() * 2.0 - 1.0) / 2);
            }
        }
    }

    public selectionTournoi(pop: Population): GeneticSystem {
        const tournoi: Population = new Population(this.tailleTournoi, false);
        for (let i = 0; i < this.tailleTournoi; i++) {
            const randomId: number = Math.floor(Math.random() * pop.taillePopulation());
            tournoi.setGeneticSystem(i, pop.getGeneticSystem(randomId));
        }
        return tournoi.getFittest();
    }
}