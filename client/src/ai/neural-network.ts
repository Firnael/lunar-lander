import {Neuron} from "./neuron";
import {GeneticSystem} from "./genetic-system";

export class NeuralNetwork{
    public hiddenNeurons: Neuron[][];
    private outputNeurons: Neuron[];
    private nbInputs: number;
    private nbHidden: number[];
    private nbOutputs: number;

    public constructor(nbInputs: number, nbHidden: number[], nbOutputs: number, origin?: GeneticSystem) {
        let genesIndex = 0;

        this.nbInputs = nbInputs;
        this.nbHidden = nbHidden;
        this.nbOutputs = nbOutputs;

        this.hiddenNeurons = [];

        for(let layer = 0; layer < nbHidden.length; layer++){
            this.hiddenNeurons[layer] = [];
            for(let i = 0; i < nbHidden[layer]; i++){
                if(layer === 0){
                    if(origin) {
                        this.hiddenNeurons[layer][i] = new Neuron(nbInputs + 1, origin, genesIndex);
                        genesIndex += nbInputs + 1;
                    }else{
                        this.hiddenNeurons[layer][i] = new Neuron(nbInputs + 1);
                    }
                }else{
                    if(origin) {
                        this.hiddenNeurons[layer][i] = new Neuron(nbHidden[layer - 1] + 1, origin, genesIndex);
                        genesIndex += nbHidden[layer - 1] + 1;
                    }else{
                        this.hiddenNeurons[layer][i] = new Neuron(nbHidden[layer - 1] + 1);
                    }
                }
            }
        }

        this.outputNeurons = [];

        for (let i = 0; i < nbOutputs; i++){
            if(origin){
                this.outputNeurons[i] = new Neuron(nbHidden[nbHidden.length - 1] + 1, origin, genesIndex);
                genesIndex += nbHidden[nbHidden.length - 1] + 1;
            }else{
                this.outputNeurons[i] = new Neuron(nbHidden[nbHidden.length - 1] + 1);
            }
        }
    }

    public evaluate(inputs: number[]): number[]{
        for(let layer = 0; layer < this.nbHidden.length; layer++){
            this.hiddenNeurons[layer].forEach(x => x.clear());
        }
        this.outputNeurons.forEach(x => x.clear());

        const hiddenOutputs: number[][] = [];
        for(let layer = 0; layer < this.nbHidden.length; layer++){
            hiddenOutputs[layer] = [];
            for(let i = 0; i < this.nbHidden[layer]; i++){
                if(layer === 0){
                    hiddenOutputs[layer][i] = this.hiddenNeurons[layer][i].evaluate(inputs);
                }else{
                    hiddenOutputs[layer][i] = this.hiddenNeurons[layer][i].evaluate(hiddenOutputs[layer - 1]);
                }
            }
        }

        const outputs: number[] = [];
        for(let outputNb = 0; outputNb < this.nbOutputs; outputNb++){
            outputs[outputNb] = this.outputNeurons[outputNb].evaluate(hiddenOutputs[this.nbHidden.length - 1]);
        }
        return outputs;
    }
    public getGenes(): GeneticSystem{
        let genes: number[] = [];
        for(let layer = 0; layer <this.nbHidden.length; layer++){
            for(let i = 0; i <this.nbHidden[layer]; i++){
                for(let j = 0; j < this.hiddenNeurons[layer][i].nbWeight(); j++){
                    genes.push(this.hiddenNeurons[layer][i].weight(j));
                }
            }
        }
        for(let i = 0; i < this.nbOutputs; i++){
            for(let j = 0; j < this.outputNeurons[i].nbWeight(); j++){
                genes.push(this.outputNeurons[i].weight(j));
            }
        }
        return new GeneticSystem(genes);
    }
}