import { LanderData, LanderRotation, LanderStatus, Player, PlayerActions } from '../Models/player';

const players: Player[] = [];

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
        status: LanderStatus.SPAWNED
      },
      actions: {
        thrust: false,
        rotate: LanderRotation.NONE
      }
    };
    players.push(player);
  },

  deletePlayer: function (uuid: string) {
    const index = getPlayerIndexByUuid(uuid);
    players.splice(index, 1);
  },

  playerExists: function (uuid: string) {
    return getPlayerIndexByUuid(uuid) >= 0;
  },

  updatePlayerActions: function (uuid: string, actions: PlayerActions) {
    const index = getPlayerIndexByUuid(uuid);
    players[index].actions = actions;
  },

  updatePlayerLander: function (data: LanderData) {
    const index = getPlayerIndexByUuid(data.uuid!); // this is bad
    players[index].lander = {
      vx: data.vx,
      vy: data.vy,
      angle: data.angle,
      altitude: data.altitude,
      usedFuel: data.usedFuel,
      status: data.status
    };
  },

  getPlayersCount: function () {
    return players.length;
  }
};

function getPlayerIndexByUuid(uuid: string) {
  return players.findIndex((p) => p.uuid === uuid);
}

export default service;
