/** Used by the webapp to rank players  */
export interface Player {
    name: string             // the player name
    attempts: number         // the attempts count
    firstLandingAttemptCount: number // the attemps count when first landing occured
    successAttempts: number  // the attempts count
    landed?: number          // is a timestamp, set during the player's ship first landing
    rank?: number            // the player rank
    usedFuelBest?: number    // the least amount of fuel used for a landing
    usedFuelAvg?: number     // the average amount of fuel used for a landing 
}