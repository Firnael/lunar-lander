import 'phaser';
import { CustomConfig } from './CustomConfig';

/**
 * Extends the base PhaserJS {@link Phaser.Game} object with a constructor using a {@link CustomConfig} object instead.
 * Store custom properties into the {@link Phaser.Game#registry} to access it later in the game
 */
export class CustomGame extends Phaser.Game {
    constructor(config: CustomConfig) {
        super(config);

        // store server config into the game registry for later use
        for (const [key, value] of Object.entries(config.serverConfig)) {
            this.registry.set(key, value);
            console.log(`Game registry, set: ${key} = ${value}`);
        }
    }
}
