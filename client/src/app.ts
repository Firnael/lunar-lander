import { PlayerActions } from './models/player';
import { LanderData, LanderRotation } from './models/lander';
import io from './services/socket';

const SERVER_URL = process.env.SERVER_URL || 'http://127.0.0.1:4000';
const PLAYER_NAME = process.env.PLAYER_NAME || 'NO_NAME';
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
    const MAX_VX = 35;
    const MAX_VY = 35;
    const MAX_ANGLE = 5;
    const DANGER_VY = 200;
    const DANGER_ZONE = 100;

    // cancel vx
    if (Math.abs(data.vx) > MAX_VX) {
      if (data.vx > 0) {
        // going right
        if (data.angle < -80) {
          if (data.angle > -100) {
            actions.thrust = true;
            actions.rotate = LanderRotation.NONE;
          } else {
            actions.rotate = LanderRotation.CLOCKWISE;
          }
        } else {
          actions.rotate = LanderRotation.COUNTERCLOCKWISE;
        }
      } else {
        // going left
        if (data.angle > 80) {
          if (data.angle < 100) {
            actions.thrust = true;
            actions.rotate = LanderRotation.NONE;
          } else {
            actions.rotate = LanderRotation.COUNTERCLOCKWISE;
          }
        } else {
          actions.rotate = LanderRotation.CLOCKWISE;
        }
      }

      return actions;
    }

    if (Math.abs(data.angle) > MAX_ANGLE) {
      if (data.angle > 0) {
        // rotated too much to the right
        actions.rotate = LanderRotation.COUNTERCLOCKWISE;
      } else {
        // rotated too much to the left
        actions.rotate = LanderRotation.CLOCKWISE;
      }
      return actions;
    }

    // cancel vy
    if (data.vy > DANGER_VY) {
      actions.thrust = true;
    }

    if (data.altitude < DANGER_ZONE && data.vy > MAX_VY) {
      actions.thrust = true;
    }

    return actions;
  });
})();
