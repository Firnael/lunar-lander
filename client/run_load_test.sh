#!/bin/bash

# Run 21 players concurrently with different names and colors
for player in "PLAYER_NAME=Bulbizarre PLAYER_COLOR=3CA225" \
              "PLAYER_NAME=Salamèche PLAYER_COLOR=E62224" \
              "PLAYER_NAME=Carapuce PLAYER_COLOR=2581EF" \
              "PLAYER_NAME=Chenipan PLAYER_COLOR=92A212" \
              "PLAYER_NAME=Roucool PLAYER_COLOR=81BAF0" \
              "PLAYER_NAME=Rattata PLAYER_COLOR=A0A2A1" \
              "PLAYER_NAME=Abo PLAYER_COLOR=923FCC" \
              "PLAYER_NAME=Pikachu PLAYER_COLOR=FAC200" \
              "PLAYER_NAME=Mélofée PLAYER_COLOR=F071EF" \
              "PLAYER_NAME=Ramoloss PLAYER_COLOR=EF3E79" \
              "PLAYER_NAME=Machoc PLAYER_COLOR=FF8100" \
              "PLAYER_NAME=Racaillou PLAYER_COLOR=B0AB81" \
              "PLAYER_NAME=Fantominus PLAYER_COLOR=713E70" \
              "PLAYER_NAME=Minidraco PLAYER_COLOR=4F5FE2" \
              "PLAYER_NAME=Ronflex PLAYER_COLOR=7E5E46" \
              "PLAYER_NAME=Mew PLAYER_COLOR=FF0080" \
              "PLAYER_NAME=Mewtwo PLAYER_COLOR=5A43A6" \
              "PLAYER_NAME=Locklass PLAYER_COLOR=0080FF" \
              "PLAYER_NAME=Abra PLAYER_COLOR=7400A1" \
              "PLAYER_NAME=Magicarpe PLAYER_COLOR=25A2E0" \
              "PLAYER_NAME=Canarticho PLAYER_COLOR=FFC125"
do
  PLAYER_NAME=${BASH_REMATCH[1]}
  PLAYER_COLOR=${BASH_REMATCH[2]}
  env $player npm run dev &
done

wait