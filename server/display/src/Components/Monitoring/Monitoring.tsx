import { useState, useEffect } from 'react'
import 'phaser'
import HttpService from '../../Services/HttpService'
import SocketService from '../../Services/SocketService'
import config from '../../Game/Config/Config'
import { PreloadScene } from '../../Game/Scenes/PreloadScene'
import { MonitoringScene } from '../../Game/Scenes/MonitoringScene';
import { PlayerJoins, PlayerLeaves, ShipLanded } from '../../Models/player'
import './Monitoring.css'

export default function Monitoring() {

  const [game, setGame] = useState<Phaser.Game>({} as Phaser.Game)

  useEffect(() => {
    // create game
    config.scene = [PreloadScene, MonitoringScene];
    const game: Phaser.Game = new Phaser.Game(config)
    setGame(game)

    game.events.on('GAME_READY', () => {
      // handle creation and destruction of ships in the game when player connect / disconnect
      game.events.on('CREATE_LANDER', (data: PlayerJoins) => handleCreateLander(data))
      game.events.on('DESTROY_LANDER', (data: any) => handleDestroyLander(data))
      // handle scores updates when ships reach the ground, either way
      game.events.on('SHIP_LANDED', (data: ShipLanded) => handleShipLanded(data))
      game.events.on('SHIP_EXPLODED', (data: any) => handleShipExploded(data))

      // connect to communication server
      const uuid = '0000' + createRandomId(4);
      const clientConfig = {
        clientName: `monitoring-${uuid}`,
        clientUuid: uuid,
        clientEmoji: '🧪',
        clientColor: '888888'
      };
      SocketService.start(HttpService.getServerUrl(), game, clientConfig);
    });
  }, []);

  function handleCreateLander(data: PlayerJoins) {
    console.log('[UI.Monitoring] PlayerJoins :', data);
  }

  function handleDestroyLander(data: PlayerLeaves) {
    console.log('[UI.Monitoring] PlayerLeaves :', data);
  }

  function handleShipLanded(data: any) {
    console.log(`[UI.Monitoring] Player's ship landed :`, data);
  }

  function handleShipExploded(data: any) {
    console.log(`[UI.Monitoring] Player's ship exploded :`, data)
  }

  function createRandomId(length: number) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  return (
    <main className="main-container">
      <div id="game" className="monitoring-game-container" />
    </main>
  )
}