import { Population } from './population';
import { NeuralNetwork } from './neural-network';
import { GameScene } from '../Game/Scenes/GameScene';
import { LanderRotation, LanderStatus, PlayerActions } from '../Models/player';
import { LanderAiInputNormalized } from './lander-ai-input-normalized';
import { LanderAiOutput } from './lander-ai-output';
import { GeneticAlgo } from './genetic-algo';

export class GameAi{

    private population: Population;
    private neuralNetworks: NeuralNetwork[];
    private scene: GameScene;
    private iteration = 1;
    private shipState: LanderStatus[];
    public constructor(sizePop: number, scene: GameScene) {
        this.scene = scene;
        this.population = new Population(sizePop, true);
        this.neuralNetworks = [];
        this.shipState = [];
        for(let i = 0; i < this.population.taillePopulation(); i++){
            this.neuralNetworks[i] = new NeuralNetwork(
                7,
                [8, 8],
                3,
                this.population.getGeneticSystem(i));
            this.shipState[i] = LanderStatus.ALIVE;
            this.scene.createShip({
                name: 'AI' + i,
                uuid: i.toFixed(),
                emoji: '',
                color: i === 0 ? 'FFFF00' : '0000FF'
            });
        }

        setInterval(this.nextGeneration.bind(this), 20000);
    }

    public nextGeneration(): void{
        console.log("New iteration "+ (this.iteration++) + " : " + this.population.getFittest().getFittest());

        const ga = new GeneticAlgo();
        this.population = ga.evoluer(this.population);

        for(let i = 0; i < this.population.taillePopulation(); i++){
            this.neuralNetworks[i] = new NeuralNetwork(
                7,
                [8, 8],
                3,
                this.population.getGeneticSystem(i));
            this.population.getGeneticSystem(i).resetScore();
        }
        this.scene.resetShips();

    }

    public updateShip(index: number, ship: any): PlayerActions {

        const actions: PlayerActions = {
            thrust: false,
            rotate: LanderRotation.NONE
        };

        const geneticSystem = this.population.getGeneticSystem(index);
        if(geneticSystem === undefined){
            return actions;
        }
        if(ship.status === 1 && this.shipState[index] !== LanderStatus.ALIVE){
            this.shipState[index] = LanderStatus.ALIVE;
        }
        if(ship.status === 3 && this.shipState[index] === LanderStatus.ALIVE){
            geneticSystem.addScore(-Math.sqrt(ship.vx*ship.vx + ship.vy*ship.vy));
            geneticSystem.addScore(-Math.abs(ship.angle))
            this.shipState[index] = LanderStatus.CRASHED;
        }
        if(ship.status === 2 && this.shipState[index] === LanderStatus.ALIVE){
            geneticSystem.addScore(10);
            this.shipState[index] = LanderStatus.LANDED;
        }
        if(ship.altitude > 1000){
            geneticSystem.addScore(-1)
            this.scene.resetShip('AI'+index);
        }
        if(Math.sqrt(ship.vx*ship.vx + ship.vy*ship.vy) > 100){
            geneticSystem.addScore(-1);
            this.scene.resetShip('AI'+index);
        }

        // Ici vous faites ce que vous voulez, mais vous DEVEZ return un objet PlayerActions

        const normalized = new LanderAiInputNormalized(ship);

        const outputRaw = this.neuralNetworks[index].evaluate(normalized.toArray());

        const outputActions = new LanderAiOutput(outputRaw);

        if(outputActions.re){
            if(outputActions.rs){
                actions.rotate = LanderRotation.CLOCKWISE;
            }else{
                actions.rotate = LanderRotation.COUNTERCLOCKWISE;
            }
        }

        if(outputActions.te){
            actions.thrust = true;
        }
        return actions;
    }

    public update(data: Map<string, any>): Map<string, PlayerActions>{
        const actions = new Map<string, PlayerActions>;
        for (const ship of data) {
            actions.set(ship[0], this.updateShip(+ship[0], ship[1]));

        }
        return actions;
    }

}