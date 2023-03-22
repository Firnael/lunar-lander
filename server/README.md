# Lunar Lander (Server)

`npm start` démarre le serveur sur le port `4000`

## Configuration

Pour modifier les limites auxquelles le vaisseau ne résiste pas à l'atterissage, modifier ces valeurs dans `Ship.ts` : 

```
private LANDING_MAX_SPEED = new Phaser.Math.Vector2(40, 40)
private LANDING_MAX_ANGLE = 15
```

Le vaisseau a un limite de carburant qui peut également être modifiée (sans carburant, le vaisseau dérive) :

```
private FUEL_TANK_SIZE = 3000
```

## Game design

### Fuel

Quantité de carburant utilisé : 
- la valeur de 'usedFuel' lorsque le vaisseau arrive à atterrir
- 3000 lorsque le vaisseau se crash

### Calcul du ranking

Le `successRate` et le `usedFuelAvg` sont utilisés pour rank les joueurs selon la formule : 

> SuccessRate / UsedFueldAverage

(sur les 20 derniers try par défaut)

### Possibles évolutions

- Doit-on récompenser un vaisseau qui
  - se pose plus droit que les autres (a-t-on vraiment la possibilité d'optimiser ça ?)
  - se pose plus vite que les autres ? (fortement lié au fuel consommé, mais il existe une marge pour que le skill s'exprime)