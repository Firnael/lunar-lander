# Lunar Lander (Server)

`npm start` démarre le serveur sur le port `4000`

## Configuration

Pour modifier les limites auxquelles le vaisseau ne résiste pas à l'atterissage, modifier ces valeurs dans `.env` : 

```
LANDING_MAX_VELOCITY_X = 40
LANDING_MAX_VELOCITY_Y = 40
LANDING_MAX_ANGLE = 15
```

Le vaisseau a une limite de carburant qui peut également être modifiée (sans carburant, le vaisseau dérive) :

```
FUEL_TANK_SIZE = 3000
```

## Game design

### Fuel

Quantité de carburant utilisé : 
- la valeur de 'usedFuel' lorsque le vaisseau arrive à atterrir
- 3000 lorsque le vaisseau se crash

### Ranking

#### Calcul

Le `successRate` et le `usedFuelAvg` sont utilisés pour rank les joueurs selon la formule : 

> SuccessRate / UsedFueldAverage

(sur les 20 derniers try par défaut)

#### Couleurs

Le `color gradient` est créé au lancement de la page, et est utilisé différement en fonction de ce qu'on veut afficher.

- <span style="color:#E6CC80">gold</span> : `#E6CC80`
- <span style="color:#FF8001">orange</span> : `#FF8001`
- <span style="color:#D44EA7">pink</span> : `#D44EA7`
- <span style="color:#9F3AED">purple</span> : `#9F3AED`
- <span style="color:#206DDE">blue</span> : `#206DDE`
- <span style="color:#5DAA9F">turquoise</span> : `#5DAA9F`
- <span style="color:#40F03F">green</span> : `#40F03F`
- <span style="color:#FFFFFF">white</span> : `#FFFFFF`

#### Possibles évolutions

- Doit-on récompenser un vaisseau qui :
  - se pose plus droit que les autres (a-t-on vraiment la possibilité d'optimiser ça ?)
  - se pose plus vite que les autres ? (fortement lié au fuel consommé, mais il existe une marge pour que le skill s'exprime)
- Lancer Phaser en HEADLESS côté serveur
  - c'est possible quoi qu'un peu tryhard : https://medium.com/@16patsle/running-phaser-3-on-the-server-4c0d09ffd5e6