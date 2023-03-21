import { useState, useEffect } from 'react'
import 'phaser'
import gameManager from '../../Services/GameManager'
import config from './Config/Config'
import { PlayerStats, PlayerJoins, PlayerLeaves, UpdatePlayersData } from '../../Models/player'
import './Game.css'

export default function Game() {

  const SUCCESS_RATE_SAMPLE_SIZE = 10

  const [game, setGame] = useState<Phaser.Game>({} as Phaser.Game)
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([])
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
    game.events.on('LANDERS_DATA', (data: UpdatePlayersData) => gameManager.updatePlayersData(data))
    // handle creation and destruction of ships in the game when player connect / disconnect
    game.events.on('CREATE_LANDER', (data: PlayerJoins) => handleCreateLander(data))
    game.events.on('DESTROY_LANDER', (data: any) => handleDestroyLander(data))
    // handle scores updates when ships reach the ground, either way
    game.events.on('SHIP_LANDED', (data: any) => handleShipLanded(data))
    game.events.on('SHIP_EXPLODED', (data: any) => handleShipExploded(data))

    // connect to game server
    gameManager.start(game)
  }, [])

  function handleCreateLander(data: PlayerJoins) {
    console.log('CREATE_LANDER : ', data)
    
    setPlayerStats((stats: PlayerStats[]) => {
      const index = stats.findIndex((s: PlayerStats) => s.name === data.name);
      if (index < 0) {
        // add player to the list if it doesn't exists already
        const s: PlayerStats = { name: data.name, color: data.color, attempts: 0, firstLandingAttemptCount: 0, successAttempts: 0, history: [] }
        return [...stats, s]
      }
      else {
        // update color if player changed it
        let updated = [...stats]
        updated[index].color = data.color
        return updated
      }
    })
  }

  function handleDestroyLander(data: PlayerLeaves) {
    console.log('DESTROY_LANDER :', data)
    //setPlayers(players.filter((p: any) => p.name !== data.name))
  }

  function handleShipLanded(data: any) {
    console.log('SHIP_LANDED :', data)
    setPlayerStats((stats: PlayerStats[]) => {
      // copy stats to an updated version will will edit
      let updated = [...stats]
      const index = updated.findIndex((s: any) => s.name === data.name)
      const player = updated[index]
      player.attempts++
      player.successAttempts++

      // if player never landed before, register timestamp and attempt count
      if (!player.landed) {
        player.landed = new Date().getTime()
        player.firstLandingAttemptCount = player.attempts
      }
      
      // update fuel info
      player.usedFuelAvg = player.usedFuelAvg ? (player.usedFuelAvg * (player.successAttempts - 1) + data.usedFuel) / player.successAttempts : data.usedFuel
      player.usedFuelAvg = parseInt(player.usedFuelAvg!.toFixed())
      player.usedFuelBest = player.usedFuelBest ? (player.usedFuelBest < data.usedFuel ? player.usedFuelBest : data.usedFuel) : data.usedFuel
      
      // update history and success rate
      player.history.push(1)
      player.successRate = updateSuccessRate(player.history)

      // update player stats
      updated[index] = player

      // sort players by rank
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
    setPlayerStats((stats: PlayerStats[]) => {
      const updated = [...stats]
      const index = updated.findIndex((s: any) => s.name === data.name)
      updated[index].attempts++
      updated[index].history.push(0)
      updated[index].successRate = updateSuccessRate(updated[index].history)
      return updated
    })
  }

  function updateSuccessRate(playerHistory: number[]): number {
    const attemptsCount = Math.min(playerHistory.length, SUCCESS_RATE_SAMPLE_SIZE)
    const lastNthAttemptsHistory = playerHistory.slice(-attemptsCount)
    const successRate = lastNthAttemptsHistory.reduce((acc, c) => acc += c, 0) / attemptsCount * 100
    return Math.floor(successRate)
  }

  const playerStatsList = playerStats.map((s: PlayerStats, i) =>
    <tr>
      <td><strong style={{textShadow: '2px 2px 2px #' + s.color}}>{s.name}</strong></td>
      <td><div key={i + s.attempts} className="pop">
        {s.attempts}
      </div></td>
      <td><div key={i + (s.landed ? 'landed' : 'not-landed') } className="pop">
        {s.landed ? '✔️(' + s.firstLandingAttemptCount + ')' : '❌'}
      </div></td>
      <td><div key={i + (s.rank ? s.rank.toString() : 'unranked')} className="pop">
        {s.rank ? (s.rank === 1 ? `${s.rank}er` : `${s.rank}ème`) : '-'}
      </div></td>
      <td><div key={i + (s.usedFuelBest ? s.usedFuelBest.toString() : 'no-usedFuelBest')} className="pop">
        {s.usedFuelBest ? s.usedFuelBest : '-'}
      </div></td>
      <td><div key={i + (s.usedFuelAvg ? s.usedFuelAvg.toString() : 'no-usedFuelAvg')} className="pop">
        {s.usedFuelAvg ? s.usedFuelAvg : '-'}
      </div></td>
      <td><div key={i + (s.successRate ? s.successRate.toString() : 'no-successRate')} className="pop">
        {s.successRate ? s.successRate + '%' : '-'}
      </div></td>
    </tr>
  )

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
              <th>🧑‍🚀</th>
              <th>🚀</th>
              <th>🎉</th>
              <th>🥇</th>
              <th>🛢️🔝</th>
              <th>🛢️♻️</th>
              <th>📈％</th>
            </tr>
          </thead>
          <tbody>
            {playerStatsList}
          </tbody>
        </table>
      </div>
      <div className="server-info-container">
        <strong>{renderedLocalIps}</strong>
      </div>
    </main>
  )
}