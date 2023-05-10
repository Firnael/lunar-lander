import { useState, useEffect } from 'react'
import HttpService from '../../Services/HttpService'
import SocketService from '../../Services/SocketService'
import { CustomGame } from '../../Game/Types/CustomGame'
import config from '../../Game/Config/CustomConfig'
import { PreloadScene } from '../../Game/Scenes/PreloadScene'
import { MonitoringScene } from '../../Game/Scenes/MonitoringScene';
import { PlayerJoins, PlayerLeaves, ShipLanded } from '../../Models/player'
import './Monitoring.css'

export default function Monitoring() {

  const [game, setGame] = useState<CustomGame>({} as CustomGame);
  const [serverConfig, setServerConfig] = useState<any>();

  useEffect(() => {
    // retrieve config (cannot start game without this)
    HttpService.fetchConfig().then(res => res.json()).then(serverConfig => {
      setServerConfig(serverConfig);
      config.serverConfig = serverConfig;
      config.scene = [PreloadScene, MonitoringScene];

      // create game
      const game: CustomGame = new CustomGame(config);
      setGame(game);

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