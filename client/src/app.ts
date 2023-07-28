import {PlayerActions} from './models/player';
import {LanderData, LanderRotation} from './models/lander';
import io from './services/socket';
import {LanderAiInputNormalized} from "./ai/lander-ai-input-normalized";
import {NeuralNetwork} from "./ai/neural-network";
import {LanderAiOutput} from "./ai/lander-ai-output";
import {Population} from "./ai/population";
import {GeneticSystem} from "./ai/genetic-system";
import socket from "./services/socket";
import {GeneticAlgo} from "./ai/genetic-algo";

const SERVER_URL = process.env.SERVER_URL || 'http://127.0.0.1:4000';

const PLAYER_NAME = process.env.PLAYER_NAME || 'AI';     // remplacez-moi !
const PLAYER_EMOJI = process.env.PLAYER_EMOJI || '💩';     // un seul emoji !
const PLAYER_COLOR = process.env.PLAYER_COLOR || 'FFFF00'; // attention, pas de # !

var population = new Population(10, true);
var neuralNetworks: NeuralNetwork[] = [];

var iteration = 0;

initialize();

setInterval(iterate, 60000);
function instanceClient(instance: number): void {

  io.start(SERVER_URL, PLAYER_NAME + instance, PLAYER_EMOJI, PLAYER_COLOR);
  io.handleLander((data: LanderData) => {
    const actions: PlayerActions = {
      thrust: false,
      rotate: LanderRotation.NONE
    };
    const geneticSystem = population.getGeneticSystem(instance);
    if(geneticSystem === undefined){
      return actions;
    }
    if(data.status === 3){
      geneticSystem.addScore(-0.1 * Math.sqrt(data.vx*data.vx + data.vy*data.vy));
    }
    if(data.status === 2){
      geneticSystem.addScore(10);
    }
    /*if(data.vy > 1000){
      geneticSystem.addScore(-1);
    }*/

    // Ici vous faites ce que vous voulez, mais vous DEVEZ return un objet PlayerActions

    const normalized = new LanderAiInputNormalized(data);

    const outputRaw = neuralNetworks[instance].evaluate(normalized.toArray());

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
  });
};

function initialize(): void{
  for(let i = 0; i < population.taillePopulation(); i++){
    neuralNetworks[i] = new NeuralNetwork(7, [16, 8], 3, population.getGeneticSystem(i));
    (async () => instanceClient(i))();
  }
}

function iterate(): void{
  const fittest = population.getFittest();
  console.log("New iteration "+ iteration++  +" : " + population.getFittest().getFittest());

  const ga = new GeneticAlgo();
  population = ga.evoluer(population);

  for(let i = 0; i < population.taillePopulation(); i++){
    neuralNetworks[i] = new NeuralNetwork(7, [16, 8], 3, population.getGeneticSystem(i));
  }


}