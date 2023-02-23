# Lunar Lander (Server)

`npm start` démarre le serveur sur le port `4000`

## Configuration

Pour modifier les limites auxquelles le vaisseau ne résiste pas à l'atterissage, modifier ces valeurs dans `Ship.ts` : 

```
private LANDING_MAX_SPEED = new Phaser.Math.Vector2(40, 40)
private LANDING_MAX_ANGLE = 15
```