// ====================================================================
// FILE: casino-logic.js
// Handles the core logic for the Roulette game.
// ====================================================================

/**
 * Defines the Roulette wheel structure (European style for simplicity: 0 and 1-36).
 * 'color' is for visual display, 'parity' for odd/even bets.
 */
const ROULETLET_WHEEL = {
    0: { color: 'green', parity: null },
    1: { color: 'red', parity: 'odd' },
    2: { color: 'black', parity: 'even' },
    3: { color: 'red', parity: 'odd' },
    4: { color: 'black', parity: 'even' },
    5: { color: 'red', parity: 'odd' },
    6: { color: 'black', parity: 'even' },
    7: { color: 'red', parity: 'odd' },
    8: { color: 'black', parity: 'even' },
    9: { color: 'red', parity: 'odd' },
    10: { color: 'black', parity: 'even' },
    11: { color: 'black', parity: 'odd' },
    12: { color: 'red', parity: 'even' },
    13: { color: 'black', parity: 'odd' },
    14: { color: 'red', parity: 'even' },
    15: { color: 'black', parity: 'odd' },
    16: { color: 'red', parity: 'even' },
    17: { color: 'black', parity: 'odd' },
    18: { color: 'red', parity: 'even' },
    19: { color: 'red', parity: 'odd' },
    20: { color: 'black', parity: 'even' },
    21: { color: 'red', parity: 'odd' },
    22: { color: 'black', parity: 'even' },
    23: { color: 'red', parity: 'odd' },
    24: { color: 'black', parity: 'even' },
    25: { color: 'red', parity: 'odd' },
    26: { color: 'black', parity: 'even' },
    27: { color: 'red', parity: 'odd' },
    28: { color: 'black', parity: 'even' },
    29: { color: 'black', parity: 'odd' },
    30: { color: 'red', parity: 'even' },
    31: { color: 'black', parity: 'odd' },
    32: { color: 'red', parity: 'even' },
    33: { color: 'black', parity: 'odd' },
    34: { color: 'red', parity: 'even' },
    35: { color: 'black', parity: 'odd' },
    36: { color: 'red', parity: 'even' },
};

/**
 * Simulates a spin and returns the winning number and its properties.
 * @returns {{number: number, color: string, parity: string}} The result.
 */
export function spinRoulette() {
    const winningNumber = Math.floor(Math.random() * 37); // Generates 0 to 36
    return {
        number: winningNumber,
        color: ROULELLET_WHEEL[winningNumber].color,
        parity: ROULELLET_WHEEL[winningNumber].parity
    };
}

/**
 * Calculates the payout based on the bet type, amount, and the winning result.
 * @param {string} betType - The type of bet placed (e.g., 'red', 'even', '1-18', or a number '15').
 * @param {number} betAmount - The amount bet.
 * @param {Object} result - The result from spinRoulette().
 * @returns {number} The net winnings (0 if lost, positive number if won).
 */
export function calculatePayout(betType, betAmount, result) {
    let multiplier = 0;
    const number = result.number;
    const color = result.color;
    const parity = result.parity;

    // --- High-Level Bets ---
    if (betType === 'red' && color === 'red') {
        multiplier = 1; // Payout 1:1 (return 2x total)
    } else if (betType === 'black' && color === 'black') {
        multiplier = 1; // Payout 1:1
    } else if (betType === 'even' && parity === 'even') {
        multiplier = 1; // Payout 1:1
    } else if (betType === 'odd' && parity === 'odd') {
        multiplier = 1; // Payout 1:1
    } else if (betType === '1-18' && number >= 1 && number <= 18) {
        multiplier = 1; // Payout 1:1
    } else if (betType === '19-36' && number >= 19 && number <= 36) {
        multiplier = 1; // Payout 1:1
    }

    // --- Single Number Bet (Hardest to win, highest payout) ---
    // If the bet type is a number (e.g., '15')
    if (!isNaN(parseInt(betType)) && parseInt(betType) === number) {
        multiplier = 35; // Payout 35:1 (return 36x total)
    }

    // Single number "0" bet
    if (betType === '0' && number === 0) {
        multiplier = 35; // Payout 35:1
    }

    return betAmount * multiplier;
}