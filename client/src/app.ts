import { PlayerActions } from './models/player';
import { LanderData, LanderRotation } from './models/lander';
import io from './services/socket';

const SERVER_URL = process.env.SERVER_URL || 'http://lunar.lander';
const PLAYER_NAME = process.env.PLAYER_NAME || 'VOTRE_NOM';
const PLAYER_EMOJI = process.env.PLAYER_EMOJI || '💩';
const PLAYER_COLOR = process.env.PLAYER_COLOR || 'FFFFFF';

(async () => {
  io.start(SERVER_URL, PLAYER_NAME, PLAYER_EMOJI, PLAYER_COLOR);
  io.handleLander((data: LanderData) => {
    const actions: PlayerActions = {
      thrust: false,
      rotate: LanderRotation.NONE
    };

    // Ici vous faites ce que vous voulez, mais vous DEVEZ return un objet PlayerActions

    return actions;
  });
})();
