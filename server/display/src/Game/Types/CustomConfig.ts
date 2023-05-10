import 'phaser';

/**
 * Extends the base PhaserJS {@link Phaser.Types.Core.GameConfig} object to add additional properties
 */
export interface CustomConfig extends Phaser.Types.Core.GameConfig {
    serverConfig: Object;
}
