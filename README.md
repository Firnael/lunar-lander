# Coding Contest : Lunar Lander

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
npm run dev
```
L'application redémarrera automatiquement à chaque modification dans le code.

## Comment jouer

Vous devez implémenter un algorithme qui permettra à votre vaisseau d'atterir sur la Lune sans exploser.  
Pour celà, il faudra compléter le callback de la fonction `io.handleLander()` dans `app.ts`.  
Votre callback doit retourner un objet `actions`, à vous de déterminer avec quelles valeurs.  

```javascript
const actions = {
    thrust: false,
    rotate: LanderRotation.NONE
}
```

## FAQ

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
