import explosion_spritesheet_url from '../Assets/images/explosion.png';
import blue_explosion_spritesheet_url from '../Assets/images/blue_explosion.png';
import ship_parts_spritesheet_url from '../Assets/images/ship_parts.png';
import ship_sprite_url from '../Assets/images/ship.png';
import training_ship_sprite_url from '../Assets/images/training_ship.png';
import fake_ship_sprite_url from '../Assets/images/fake_ship.png';
import background_sprite_url from '../Assets/images/background.png';
import training_background_sprite_url from '../Assets/images/training_background.png';
import training_background_dark_sprite_url from '../Assets/images/training_background_dark.png';
import training_blocks_spritesheet_url from '../Assets/images/training_blocks_spritesheet.png';
import monitor_background_sprite_url from '../Assets/images/monitor_background.png';
import moon_ground_sprite_url from '../Assets/images/moon_ground.png';
import indicator_sprite_url from '../Assets/images/indicator.png';
import flag_sprite_url from '../Assets/images/flag.png';
import danger_sign_sprite_url from '../Assets/images/danger_sign.png';
import danger_velocity_sprite_url from '../Assets/images/danger_velocity.png';
import danger_angle_sprite_url from '../Assets/images/danger_angle.png';
import smoke_particule_sprite_url from '../Assets/images/smoke_particule.png';
import fire_particule_sprite_url from '../Assets/images/fire_particule.png';
import acceleration_particule_sprite_url from '../Assets/images/acceleration_particule.png';
import fake_main_engine_sprite_url from '../Assets/images/fake_main_engine.png';
import fake_aux_engine_sprite_url from '../Assets/images/fake_aux_engine.png';
import grow_window_button_sprite_url from '../Assets/images/grow_window_button.png';
import shrink_window_button_sprite_url from '../Assets/images/shrink_window_button.png';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'PreloadScene'
        });
    }

    preload(): void {
        console.log(this.scene.key);

        // spritesheets
        this.load.spritesheet('explosion', explosion_spritesheet_url, { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('blue_explosion', blue_explosion_spritesheet_url, { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('shipParts', ship_parts_spritesheet_url, { frameWidth: 25, frameHeight: 16 });
        // images
        this.load.image('ship', ship_sprite_url);
        this.load.image('trainingShip', training_ship_sprite_url);
        this.load.image('fake_ship', fake_ship_sprite_url);
        this.load.image('background', background_sprite_url);
        this.load.image('trainingBackground', training_background_sprite_url);
        this.load.image('trainingBackgroundDark', training_background_dark_sprite_url);
        this.load.spritesheet('trainingBlocks', training_blocks_spritesheet_url, { frameWidth: 59, frameHeight: 59 });
        this.load.image('monitorBackground', monitor_background_sprite_url);
        this.load.image('moonGround', moon_ground_sprite_url);
        this.load.image('indicator', indicator_sprite_url);
        this.load.image('flag', flag_sprite_url);
        this.load.image('dangerSign', danger_sign_sprite_url);
        this.load.image('dangerVelocity', danger_velocity_sprite_url);
        this.load.image('dangerAngle', danger_angle_sprite_url);
        this.load.image('fakeMainEngine', fake_main_engine_sprite_url);
        this.load.image('fakeAuxEngine', fake_aux_engine_sprite_url);
        this.load.image('growWindowButton', grow_window_button_sprite_url);
        this.load.image('shrinkWindowButton', shrink_window_button_sprite_url);
        
        // particules
        this.load.image('smoke_particule', smoke_particule_sprite_url);
        this.load.image('fire_particule', fire_particule_sprite_url);
        this.load.image('acceleration_particule', acceleration_particule_sprite_url);
    }

    create(): void {
        // always load the 2nd scene in the scene pool since there can only be 2
        // (either 'Display', 'Monitoring' or 'Training')
        const nextScene = this.scene.manager.getAt(1);
        this.scene.start(nextScene);
    }
}
