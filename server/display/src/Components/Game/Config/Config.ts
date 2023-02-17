import 'phaser';
import { GameScene } from '../Scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
    title: "Lunar Lander",
    url: 'https://github.com/Firnael/lunar-lander',
    version: '1.0',
    width: 1280,
    height: 920,
    type: Phaser.AUTO,
    parent: 'game', // besoin d'une div id="game"
    scene: [
      GameScene
    ],
    input: {
      keyboard: true
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    backgroundColor: '#300000',
    render: { pixelArt: true, antialias: true }
  };

export default config;