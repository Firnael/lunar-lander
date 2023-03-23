import 'phaser';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';
import { GameScene } from '../Scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  title: 'Lunar Lander',
  url: 'https://github.com/Firnael/lunar-lander',
  version: '1.1.0',
  type: Phaser.AUTO,
  scale: {
    parent: 'game', // besoin d'une div id="game"
    mode: Phaser.Scale.FIT,
    width: '100%',
    height: '100%'
  },
  scene: [GameScene],
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
  render: { pixelArt: true, antialias: true },
  plugins: {
    global: [
      {
        key: 'rexOutlinePipeline',
        plugin: OutlinePipelinePlugin,
        start: true
      }
    ]
  }
};

export default config;
