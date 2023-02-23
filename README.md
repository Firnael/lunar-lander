# Lunar Lander

Un *Coding Contest* en mode *Bot Battle*.

Qui arrivera à faire atterir son vaisseau le premier sans l'exploser ?

## Mise en place

Quelqu'un doit faire office de serveur, et doit le lancer sur sa machine.

```shell
cd server
npm start
```

Vérifier que le serveur tourne bien en allant sur `http://localhost:4000/game`  
Vérifiez que tous les clients peuvent accéder au serveur sur l'URL : `IP_DE_LA_MACHINE_SERVEUR:4000/game`

Ensuite, chaque client doit lancer son programme :
```shell
cd client
...
# penser à mettre à jour cette ligne en haut de app.ts
const SERVER_URL = process.env.SERVER_URL || 'http://127.0.0.1:4000';
...
npm run dev
```
L'application redémarrera automatiquement à chaque modification dans le code.

Chaque client peut customiser son vaisseau avec un nom et un emoji : 

```javascript
const PLAYER_NAME = process.env.PLAYER_NAME || 'NO_NAME';
const PLAYER_EMOJI = process.env.PLAYER_EMOJI || '💩';
```

## Comment jouer

Vous devez implémenter un algorithme qui permettra à votre vaisseau d'atterir sur la Lune sans exploser.  
Pour celà, votre vaisseau devra respecter une limite de vitesse et d'angle lorsqu'il touche le sol.  
Par défaut, ces valeurs sont vx=40, vy=40, ang=15.  
Au dessus, vous êtes dans la [DANGER ZONE](https://www.youtube.com/watch?v=siwpn14IE7E&ab_channel=KennyLogginsVEVO).  

Pour celà, il faudra compléter le callback de la fonction `io.handleLander()` dans `app.ts`.  
Votre callback doit retourner un objet `actions`, à vous de déterminer avec quelles valeurs.  

```javascript
const actions = {
    thrust: false,
    rotate: LanderRotation.NONE
}
```

## Télémétrie

### Données à envoyer au serveur

- `thrust` signifie "poussée", et détermine si le moteur doit s'allumer ou pas
- `rotate` signifie "tourner, pivoter", et détermine le sens dans lequel doit tourner le vaisseau
  - `CLOCKWISE` signifie "dans le sens des aiguilles d'une montre"
  - `COUNTERCLOCKWISE` signifie "dans le sens INVERSE des aiguilles d'une montre"
  - `NONE` signifie que le vaisseau ne doit pas tourner

### Données venant du serveur

- `angle` : Angle de rotation du vaisseau
  - `0` si le vaisseau pointe vers le haut
  - `-90` si le vaisseau pointe vers la gauche
  - `90` si le vaisseau pointe vers la droite
  - `+/-180` si le vaisseau pointe vers le bas
- `vx` : vitesse horizontale
- `vy` : vitesse vertical
- `altitude` : distance entre le vaisseau et le sol
- `usedFuel` : la quantité de carburant utilisé dans cette tentative
