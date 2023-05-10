import { useState, useEffect } from 'react'
import HttpService from '../../Services/HttpService'
import { CustomGame } from '../../Game/Types/CustomGame'
import config from '../../Game/Config/CustomConfig'
import { PreloadScene } from '../../Game/Scenes/PreloadScene'
import { TrainingScene } from '../../Game/Scenes/TrainingScene';
import './Training.css'

export default function Training() {

  const [game, setGame] = useState<CustomGame>({} as CustomGame);
  const [serverConfig, setServerConfig] = useState<any>();

  useEffect(() => {
    HttpService.fetchConfig().then(res => res.json()).then(serverConfig => {
      setServerConfig(serverConfig);
      config.serverConfig = serverConfig;
      config.scene = [PreloadScene, TrainingScene];

      // create game
      const game: CustomGame = new CustomGame(config);
      setGame(game);

    });
  }, []);

  return (
    <main className="main-container">
      <div id="game" className="training-game-container" />
    </main>
  )
}