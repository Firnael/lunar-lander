import { useState, useEffect } from 'react'
import 'phaser'
import config from '../../Game/Config/Config'
import { PreloadScene } from '../../Game/Scenes/PreloadScene'
import { TrainingScene } from '../../Game/Scenes/TrainingScene';
import './Training.css'

export default function Training() {

  const [game, setGame] = useState<Phaser.Game>({} as Phaser.Game)

  useEffect(() => {
    // create game
    config.scene = [PreloadScene, TrainingScene];
    const game: Phaser.Game = new Phaser.Game(config)
    setGame(game)
  }, []);

  return (
    <main className="main-container">
      <div id="game" className="training-game-container" />
    </main>
  )
}