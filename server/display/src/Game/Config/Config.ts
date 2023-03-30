import 'phaser';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';
import HorrifiPipelinePlugin from 'phaser3-rex-plugins/plugins/horrifipipeline-plugin.js';

const config: Phaser.Types.Core.GameConfig = {
  title: 'Lunar Lander',
  url: 'https://github.com/Firnael/lunar-lander',
  version: '1.2.0',
  type: Phaser.AUTO,
  scale: {
    parent: 'game', // Phaser needs this to know where to hook the canvas inside DOM
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%'
  },
  scene: [
    // add scene dynamically here
  ],
  input: {
    keyboard: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 50 },
      debug: true // this is disabled by default in the GameScene and toggle-ized
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
      },
      {
        key: 'rexHorrifiPipeline',
        plugin: HorrifiPipelinePlugin,
        start: true
    }
    ]
  }
};

export default config;
