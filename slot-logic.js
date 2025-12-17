// ====================================================================
// FILE: slot-logic.js
// Handles the core logic for the Slot Machine game.
// ====================================================================

/**
 * Symbol Definitions and Weights (Lower weight = rarer)
 * Weights define the probability of drawing the symbol.
 */
const SYMBOL_WEIGHTS = {
    // Rarity: High
    CHERRY: { weight: 40, emoji: '🍒', payout: 2 },
    GRAPE:  { weight: 30, emoji: '🍇', payout: 3 },

    // Rarity: Medium
    LEMON:  { weight: 20, emoji: '🍋', payout: 5 },
    BELL:   { weight: 10, emoji: '🔔', payout: 10 },

    // Rarity: Low (Jackpot symbols)
    DIAMOND: { weight: 5, emoji: '💎', payout: 50 },
    SEVEN:   { weight: 2, emoji: '7️⃣', payout: 100 }
};

export const SYMBOL_EMOJIS = {};
Object.keys(SYMBOL_WEIGHTS).forEach(key => {
    SYMBOL_EMOJIS[key] = SYMBOL_WEIGHTS[key].emoji;
});

// Create a flat array of all symbols based on their weights for weighted random selection
const WEIGHTED_SYMBOLS = [];
Object.keys(SYMBOL_WEIGHTS).forEach(key => {
    for (let i = 0; i < SYMBOL_WEIGHTS[key].weight; i++) {
        WEIGHTED_SYMBOLS.push(key);
    }
});


/**
 * Simulates a slot machine spin and determines the result and payout.
 * @param {number} betAmount - The amount bet by the player.
 * @returns {{reels: string[], payout: number, winType: string}} The spin result.
 */
export function spinSlot(betAmount) {
    const reels = [];
    let payout = 0;
    let winType = 'NO WIN';

    // 1. Determine symbols for the three reels
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * WEIGHTED_SYMBOLS.length);
        reels.push(WEIGHTED_SYMBOLS[randomIndex]);
    }

    const [r1, r2, r3] = reels;

    // 2. Check for winning combinations

    // Triple Jackpot (3 of the same rare symbol)
    if (r1 === r2 && r2 === r3) {
        const symbolData = SYMBOL_WEIGHTS[r1];
        const multiplier = symbolData.payout * 10; // Extra bonus for triple match
        payout = betAmount + (betAmount * multiplier);
        winType = `JACKPOT! TRIPLE ${symbolData.emoji}`;
    }
    // Double Match (2 of the same symbol, plus a non-matching symbol)
    else if (r1 === r2 || r1 === r3 || r2 === r3) {
        const matchingSymbol = r1 === r2 ? r1 : r1 === r3 ? r1 : r2;
        const symbolData = SYMBOL_WEIGHTS[matchingSymbol];
        const multiplier = symbolData.payout;
        payout = betAmount + (betAmount * multiplier);
        winType = `DOUBLE ${symbolData.emoji} WIN!`;
    }

    // If no win, the payout is 0 (the player already lost the bet amount)

    return { reels, payout, winType };
}