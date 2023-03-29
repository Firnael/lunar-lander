import { useState, useEffect } from 'react'
import 'phaser'
import tinygradient from 'tinygradient'
import tinycolor from 'tinycolor2'
import SocketService from '../../Services/SocketService'
import config from './Config/Config'
import { PlayerStats, PlayerJoins, PlayerLeaves, SimulationData, AttemptsHistory, ShipLanded } from '../../Models/player'
import './Game.css'

export default function Game() {

  const SUCCESS_RATE_SAMPLE_SIZE = 20
  const rankingGradient = tinygradient([
    '#FFFFFF', '#40F03F', '#5DAA9F', '#206DDE',
    '#9F3AED', '#D44EA7', '#FF8001', '#E6CC80' ])

  const [game, setGame] = useState<Phaser.Game>({} as Phaser.Game)
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([])
  const [localIps, setLocalIps] = useState<any>()

  useEffect(() => {
    // create game
    const game: Phaser.Game = new Phaser.Game(config)
    setGame(game)

    game.events.on('GAME_READY', () => {
       // handle game events
      game.events.on('SIMULATION_DATA', (data: SimulationData) => SocketService.handleSimulationData(data))
      
      // handle creation and destruction of ships in the game when player connect / disconnect
      game.events.on('CREATE_LANDER', (data: PlayerJoins) => handleCreateLander(data))
      game.events.on('DESTROY_LANDER', (data: any) => handleDestroyLander(data))
      // handle scores updates when ships reach the ground, either way
      game.events.on('SHIP_LANDED', (data: ShipLanded) => handleShipLanded(data))
      game.events.on('SHIP_EXPLODED', (data: any) => handleShipExploded(data))

      // connect to communication server
      SocketService.start(game)
    });

    // retrieve local ips
    SocketService.fetchLocalIps().then(res => res.json()).then(ips => {
      setLocalIps(ips)
    })
  }, [])

  function handleCreateLander(data: PlayerJoins) {
    console.log('[UI] Add player to leaderboard :', data)
    
    setPlayerStats((stats: PlayerStats[]) => {
      const index = stats.findIndex((s: PlayerStats) => s.name === data.name);
      if (index < 0) {
        // add player to the list if it doesn't exists already
        const s: PlayerStats = { name: data.name, color: data.color, attempts: 0, firstLandingAttemptCount: 0, successAttempts: 0, attemptsHistory: [] }
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
    console.log(`[UI] Player's ship landed :`, data);
    updatePlayerStats(data, true)
  }

  function handleShipExploded(data: any) {
    console.log(`[UI] Player's ship exploded :`, data)
    updatePlayerStats(data, false)
  }

  function updatePlayerStats(data: any, success: boolean) {
    setPlayerStats((stats: PlayerStats[]) => {
      // copy stats to an updated version will will edit
      let updated = [...stats]
      const index = updated.findIndex((s: any) => s.name === data.name)
      const player = updated[index]
      player.attempts++

      if (success) {
        player.successAttempts++
        
        // update all time best fuel used info
        player.usedFuelBest = player.usedFuelBest ? (player.usedFuelBest < data.usedFuel ? player.usedFuelBest : data.usedFuel) : data.usedFuel

        // if player never landed before, register timestamp and first successful landing attempt count
        if (!player.landed) {
          player.landed = new Date().getTime()
          player.firstLandingAttemptCount = player.attempts
        }
      }
      
      // update attemps history, success rate and average used fuel
      player.attemptsHistory.push({ success: success, usedFuel: data.usedFuel })
      player.successRate = updateSuccessRate(player.attemptsHistory)
      player.usedFuelAvg = updateUsedFuelAverage(player.attemptsHistory)

      // replace old with new data
      updated[index] = player

      // sort players by rank (best combination of success rate and average used fuel)
      updated = updated.sort((a, b) => {
        if (a.landed && b.landed) {
          return (b.successRate! / b.usedFuelAvg!) - (a.successRate! / a.usedFuelAvg!)
        }
        return a.landed ? -1 : 1
      })
      for (const i in updated) {
        updated[i].rank = parseInt(i) + 1
      }
      return updated
    })
  }

  function updateSuccessRate(history: AttemptsHistory[]): number {
    const lastNthAttemptsHistory = retrieveNthLastAttemptsHistory(history)
    const successRate = lastNthAttemptsHistory
      .reduce((acc, c) => acc += (c.success ? 1 : 0), 0) / lastNthAttemptsHistory.length * 100
    return Math.floor(successRate)
  }

  function updateUsedFuelAverage(history: AttemptsHistory[]): number {
    const lastNthAttemptsHistory = retrieveNthLastAttemptsHistory(history)
    const usedFuelAverage = lastNthAttemptsHistory
      .reduce((acc, c) => acc += c.usedFuel, 0) / lastNthAttemptsHistory.length
    return Math.floor(usedFuelAverage)
  }

  function retrieveNthLastAttemptsHistory(history: AttemptsHistory[]): AttemptsHistory[] {
    const attemptsCount = Math.min(history.length, SUCCESS_RATE_SAMPLE_SIZE)
    return history.slice(-attemptsCount)
  }

  function getColorByFuelUsedAvg(fuelUsedAvg: number) {
    // convert a number from 0 to 3000 to a number from 1 to 0
    // TODO retrieve the '3000' number from the game
    const value = 1 - (fuelUsedAvg / 3000)
    return rankingGradient.rgbAt(value).toHexString()
  }

  function getColorBySuccessRate(rank: number) {
    return rankingGradient.rgbAt(rank / 100).toHexString()
  }

  function getRankColorByRank(rank: number | undefined) {
    switch (rank) {
      case 1: return 'gold'; break;
      case 2: return 'silver'; break;
      case 3: return 'bronze'; break;
      default: return 'none';
    }
  }

  const playerStatsList = playerStats.map((s: PlayerStats, i) =>
    <tr>
      <td><div key={i + s.name} className="pop">
        <mark style={{backgroundColor: '#' + s.color, color: tinycolor(s.color).getBrightness() >= 128 ? '#111' : '#eee'}}>
          {s.name}
        </mark>
      </div></td>

      <td><div key={i + (s.rank ? s.rank.toString() : 'unranked')} className="pop">
        <mark className={ getRankColorByRank(s.rank) }>
          {s.rank ? '#' + s.rank : '-'}
        </mark>
      </div></td>

      <td><div key={i + s.attempts} className="pop">
        {s.attempts} {s.landed ? '(' + s.firstLandingAttemptCount + ')' : '❌'}
      </div></td>

      {/* <td><div key={i + (s.usedFuelBest ? s.usedFuelBest.toString() : 'no-usedFuelBest')} className="pop">
        {s.usedFuelBest ? s.usedFuelBest : '-'}
      </div></td> */}

      <td><div key={i + (s.usedFuelAvg ? s.usedFuelAvg.toString() : 'no-usedFuelAvg')} className="pop">
        <mark style={{backgroundColor: getColorByFuelUsedAvg(s.usedFuelAvg || 3000)}}>
          {s.usedFuelAvg ? s.usedFuelAvg : '-'}
        </mark>
      </div></td>

      <td><div key={i + (s.successRate ? s.successRate.toString() : 'no-successRate')} className="pop">
        <mark style={{backgroundColor: getColorBySuccessRate(s.successRate || 0)}}>
          {s.successRate ? s.successRate + '%' : '-'}
        </mark>
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
              <th>🥇</th>
              <th>🚀</th>
              {/* <th>🛢️🔝</th> */}
              <th>🛢️</th>
              <th>📈</th>
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