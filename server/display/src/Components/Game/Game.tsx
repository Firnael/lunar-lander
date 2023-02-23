import { useState, useEffect } from 'react'
import 'phaser'
import gameManager from '../../Services/GameManager'
import config from './Config/Config'
import { Player } from './Models/Player'
import './Game.css'

export default function Game() {

  const [game, setGame] = useState<Phaser.Game>({} as Phaser.Game)
  const [players, setPlayers] = useState<Player[]>([])
  const [localIps, setLocalIps] = useState<any>()

  useEffect(() => {
    // create game
    const game: Phaser.Game = new Phaser.Game(config)
    setGame(game)
    // retrieve local ips
    gameManager.fetchLocalIps().then(res => res.json()).then(ips => {
      setLocalIps(ips)
    })

    // handle game events
    game.events.on('LANDERS_DATA', (data: any) => gameManager.updatePlayersData(data))
    // handle creation and destruction of ships in the game when player connect / disconnect
    game.events.on('CREATE_LANDER', (data: any) => handleCreateLander(data))
    game.events.on('DESTROY_LANDER', (data: any) => handleDestroyLander(data))
    // handle scores updates when ships reach the ground, either way
    game.events.on('SHIP_LANDED', (data: any) => handleShipLanded(data))
    game.events.on('SHIP_EXPLODED', (data: any) => handleShipExploded(data))

    // connect to game server
    gameManager.start(game)
  }, [])

  function handleCreateLander(data: any) {
    console.log('CREATE_LANDER : ', data)
    // add player to the list if it doesn't exists already
    setPlayers((players: Player[]) => {
      if (players.findIndex((p: Player) => p.name === data.name) < 0) {
        const player: Player = { name: data.name, attempts: 0, firstLandingAttemptCount: 0, successAttempts: 0 }
        return [...players, player]
      }
      return players
    })
  }

  function handleDestroyLander(data: any) {
    console.log('DESTROY_LANDER :', data)
    //setPlayers(players.filter((p: any) => p.name !== data.name))
  }

  function handleShipLanded(data: any) {
    console.log('SHIP_LANDED :', data)
    setPlayers((p: Player[]) => {
      let updated = [...p]
      const index = updated.findIndex((t: any) => t.name === data.name)
      const player = updated[index]
      if (!player.landed) {
        player.landed = new Date().getTime()
      }
      player.attempts++
      player.firstLandingAttemptCount = player.attempts
      player.successAttempts++
      player.usedFuelAvg = player.usedFuelAvg ? (player.usedFuelAvg * (player.successAttempts - 1) + data.usedFuel) / player.successAttempts : data.usedFuel
      player.usedFuelAvg = parseInt(player.usedFuelAvg!.toFixed())
      player.usedFuelBest = player.usedFuelBest ? (player.usedFuelBest < data.usedFuel ? player.usedFuelBest : data.usedFuel) : data.usedFuel
      updated[index] = player
      updated = updated.sort((a, b) => {
        if (a.landed && b.landed) {
          return a.usedFuelBest! - b.usedFuelBest!
        }
        return a.landed ? -1 : 1
      })
      for (const i in updated) {
        updated[i].rank = parseInt(i) + 1
      }
      return updated
    })
  }

  function handleShipExploded(data: any) {
    console.log('SHIP_EXPLODED :', data)
    setPlayers((players: Player[]) => {
      const updated = [...players]
      const index = updated.findIndex((t: any) => t.name === data.name)
      updated[index].attempts++
      return updated
    })
  }

  const listPlayers = players.map((p: Player) =>
    <tr>
      <td><strong>{p.name}</strong></td>
      <td>{p.attempts}</td>
      <td>{p.landed ? '✔️ (' + p.firstLandingAttemptCount + ')' : '❌'} </td>
      <td>{p.rank ? (p.rank === 1 ? `${p.rank}er` : `${p.rank}ème`) : '-'} </td>
      <td>{p.usedFuelBest ? p.usedFuelBest : '-'}</td>
      <td>{p.usedFuelAvg ? p.usedFuelAvg : '-'}</td>
    </tr>
  )

  // { localIps && Object.entries(localIps).map(([k,v]: any) => `${k} - ${v}`) }
  const renderedLocalIps = localIps && Object.entries(localIps).map(([k,v]: any) => 
    <p>{k} - {v}</p>
  )

  return (
    <main className="main-container">
      <div id="game" className="game-container" />
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name<br/>🚀</th>
              <th>Tries<br/>♻️</th>
              <th>Landed<br/>📥</th>
              <th>Rank<br/>🥇</th>
              <th>Best<br/>🛢️</th>
              <th>Avg<br/>  🛢️</th>
            </tr>
          </thead>
          <tbody>
            {listPlayers}
          </tbody>
        </table>
      </div>
      <div className="server-info-container">
        <strong>{renderedLocalIps}</strong>
      </div>
    </main>
  )
}