// ====================================================================
// FILE: betting-logic.js
// Handles communication between the betting pages and the main game's cash state.
// ====================================================================

// Function to load the player's current cash
export async function loadPlayerState() {
    // Check if the main game's player object is available globally (from index.html)
    if (window.player && typeof window.player.cash === 'number') {
        return window.player.cash;
    }
    // Fallback if running the betting page standalone
    return 5000;
}

// Function to save the new cash amount
export async function savePlayerCash(newCash) {
    if (window.player) {
        window.player.cash = newCash;
    }
    if (window.saveGameState) {
        // Trigger the Firebase save defined in index.html
        await window.saveGameState();
    }
    if (window.updateHUD) {
        // Update the main game's HUD immediately for visual feedback
        window.updateHUD();
    }
}