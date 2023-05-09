import { LanderDangerStatus, LanderData, LanderRotation, LanderStatus, Player, PlayerActions } from '../Models/player';

const players: Map<string, Player> = new Map();

const service = {
  createPlayer: function (name: string, uuid: string, emoji: string, color: string) {
    const player: Player = {
      uuid,
      name,
      emoji,
      color,
      lander: {
        vx: 0,
        vy: 0,
        angle: 0,
        altitude: 0,
        usedFuel: 0,
        status: LanderStatus.SPAWNED,
        dangerStatus: LanderDangerStatus.SAFE
      },
      actions: {
        thrust: false,
        rotate: LanderRotation.NONE
      }
    };
    players.set(uuid, player);
  },

  deletePlayer: function (uuid: string) {
    players.delete(uuid);
  },

  playerExists: function (uuid: string) {
    return players.has(uuid);
  },

  updatePlayerActions: function (uuid: string, actions: PlayerActions) {
    const player = players.get(uuid);
    if (player) {
      player.actions = actions;
      players.set(uuid, player);
    } else {
      console.warn(`Could not update actions, player with UUID "${uuid}" not found`);
    }
  },

  updatePlayerLander: function (uuid: string, data: LanderData) {
    const player = players.get(uuid);
    if (player) {
      player.lander = {
        vx: data.vx,
        vy: data.vy,
        angle: data.angle,
        altitude: data.altitude,
        usedFuel: data.usedFuel,
        status: data.status,
        dangerStatus: data.dangerStatus
      };
      players.set(uuid, player);
    } else {
      console.warn(`Could not update actions, player with UUID "${uuid}" not found`);
    }
  },

  getPlayersCount: function () {
    return players.size;
  }
};

export default service;
