// ====================================================================
// FILE: multiplayer-logic.js
// Handles ALL Firebase RTDB connectivity and multiplayer logic.
// This is imported by both index.html and multiplayer.html.
// ====================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
    getDatabase,
    ref,
    get,
    set,
    onValue,
    update,
    remove,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

// --- Configuration (Must match your project details) ---
const firebaseConfig = {
    apiKey: "AIzaSyBrtftJ8O5izi5vq6SwEeWtg87MaQvAcVM",
    authDomain: "aianalyser-c0dd2.firebaseapp.com",
    projectId: "aianalyser-c0dd2",
    databaseURL: "https://aianalyser-c0dd2-default-rtdb.firebaseio.com",
    storageBucket: "aianalyser-c0dd2.firebasestorage.app",
    messagingSenderId: "327749312228",
    appId: "1:327749312228:web:c5d699a7f57d627a85d6f1",
    measurementId: "G-8K8VY0KS70"
};

const appId = firebaseConfig.projectId;
let app, rtdb, auth;
let userId = null;
let isAuthReady = false;
let hasFirebase = Object.keys(firebaseConfig).length > 0 && !!firebaseConfig.apiKey;

// --- Multiplayer State (EXPOSED GLOBALS) ---
// These are attached to the window object for easy access by HTML and other scripts.
window.isMultiplayer = false;
window.sessionCode = null;
window.playerSlot = null;
window.sessionRef = null;
window.opponentState = null;
window.opponentLastSeen = 0;
const MULTIPLAYER_WRITE_MS = 120;
const OPPONENT_TIMEOUT_MS = 8000;

// RTDB path for session nodes
function getSessionRef(code) {
    return ref(rtdb, `multiplayer/${appId}/sessions/${code}`);
}

// helper: random 6-character code
function makeSessionCode() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out.toLowerCase();
}

// Dummy player template for session creation (to be overwritten by actual game data)
const PLAYER_TEMPLATE = {
    x: 400, y: 225, angle: 0, speed: 0, color: '#ff007f', heat: 0
};

// --- CORE RTDB FUNCTIONS ---

export function setupFirebase(onReadyCallback) {
    if (!hasFirebase) {
        if (onReadyCallback) onReadyCallback();
        return;
    }

    try {
        app = initializeApp(firebaseConfig);
        rtdb = getDatabase(app);
        auth = getAuth(app);

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
            } else {
                await signInAnonymously(auth);
                userId = auth.currentUser.uid;
            }
            isAuthReady = true;
            if (onReadyCallback) onReadyCallback();
        });
    } catch (error) {
        console.error("FATAL ERROR: Failed to initialize Firebase SDK:", error);
        if (onReadyCallback) onReadyCallback();
    }
}

export async function createSession() {
    // We assume the main game's player object is accessible via window.player
    const player = window.player || PLAYER_TEMPLATE;

    if (!isAuthReady || !rtdb || window.isMultiplayer) {
        window.alert('Multiplayer not ready. Check console/status.');
        return;
    }

    const code = makeSessionCode();
    const sessionRef = getSessionRef(code);

    const sessionData = {
        createdAt: serverTimestamp(),
        hostId: userId,
        player1: { ...player, uid: userId, lastUpdate: Date.now() },
        player2: null,
        started: false
    };

    try {
        await set(sessionRef, sessionData);
        window.sessionCode = code;
        window.sessionRef = sessionRef;
        window.playerSlot = 'player1';
        window.isMultiplayer = true;
        setupSessionListener(sessionRef);
        startMultiplayerUpdates(sessionRef, player);

        // Use exposed HUD update function
        if (window.updateHUD) window.updateHUD();
        if (window.showOverlay) window.showOverlay(`<div>Session created.<br>Code: <strong>${code.toUpperCase()}</strong></div>`, `<div class="flex flex-col space-y-2"><button class="btn-action uniform-button" onclick="window.hideOverlay()">OK</button><button class="btn-secondary uniform-button" onclick="window.leaveSession()">Leave Session</button></div>`);
        else alert(`Session created! Code: ${code.toUpperCase()}`);

    } catch (err) {
        console.error('Error creating session:', err);
        window.alert('Failed to create session. Check DB Rules.');
    }
}

export async function joinSession() {
    const codeInput = document.getElementById('joinCodeInput').value;
    const player = window.player || PLAYER_TEMPLATE;

    if (!isAuthReady || !rtdb || window.isMultiplayer) {
        window.alert('Multiplayer not ready or already active.');
        return;
    }
    const code = (codeInput || '').toLowerCase().trim();
    if (!code) {
        window.alert('Please enter a valid session code.');
        return;
    }
    const sessionRef = getSessionRef(code);

    try {
        const snap = await get(sessionRef);
        if (!snap.exists()) {
            window.alert('Error: Session not found.');
            return;
        }
        const data = snap.val();

        if (!data.player2) {
            const updateObj = {
                player2: { ...player, uid: userId, lastUpdate: Date.now() }
            };
            await update(sessionRef, updateObj);

            window.sessionCode = code;
            window.sessionRef = sessionRef;
            window.playerSlot = 'player2';
            window.isMultiplayer = true;
            setupSessionListener(sessionRef);
            startMultiplayerUpdates(sessionRef, player);

            if (window.showOverlay) window.showOverlay(`<div>Joined session <strong>${code.toUpperCase()}</strong>!</div>`, `<div class="flex flex-col space-y-2"><button class="btn-action uniform-button" onclick="window.hideOverlay()">OK</button><button class="btn-secondary uniform-button" onclick="window.leaveSession()">Leave Session</button></div>`);
            else alert(`Joined session! Code: ${code.toUpperCase()}`);

            if (window.updateHUD) window.updateHUD();

        } else {
            window.alert('Error: Session is full.');
        }
    } catch (err) {
        console.error('Error joining session:', err);
        window.alert('Failed to join session. Check DB Rules.');
    }
}

export async function leaveSession() {
    if (!window.isMultiplayer || !window.sessionRef || !window.playerSlot) return;

    try {
        const emptyObj = {};
        emptyObj[window.playerSlot] = null;
        await update(window.sessionRef, emptyObj);

        const snap = await get(window.sessionRef);
        if (snap.exists()) {
            const data = snap.val();
            if (!data.player1 && !data.player2) {
                await remove(window.sessionRef);
            }
        }
    } catch (err) {
        console.warn('Error leaving session:', err);
    }

    // Reset local state and listeners
    if (window.sessionUnsubscribe) { window.sessionUnsubscribe(); window.sessionUnsubscribe = null; }
    stopMultiplayerUpdates();

    window.isMultiplayer = false;
    window.sessionCode = null;
    window.playerSlot = null;
    window.sessionRef = null;
    window.opponentState = null;
    if (window.updateHUD) window.updateHUD();
    if (window.hideOverlay) window.hideOverlay();
}


// --- Listener/Update Helpers (Internal) ---

let sessionUnsubscribe = null;
function setupSessionListener(sessionRef) {
    if (sessionUnsubscribe) sessionUnsubscribe();
    sessionUnsubscribe = onValue(sessionRef, (snap) => {
        if (!snap.exists()) {
            if (window.stopMultiplayer) window.stopMultiplayer('Session closed.');
            else window.alert('Session closed by host.');
            return;
        }
        const data = snap.val();
        const mySlot = window.playerSlot;
        const oppSlot = mySlot === 'player1' ? 'player2' : 'player1';
        const opp = data[oppSlot];

        if (opp && opp.uid && opp.uid !== userId) {
            window.opponentState = {
                x: opp.x,
                y: opp.y,
                angle: opp.angle,
                speed: opp.speed,
                color: opp.color
            };
            window.opponentLastSeen = performance.now();
        }

        if (!opp || !opp.uid) {
            window.opponentState = null;
        }
    });
}

function startMultiplayerUpdates(sessionRef, player) {
    if (!window.isMultiplayer || !sessionRef || !window.playerSlot) return;
    stopMultiplayerUpdates();

    const writeData = async () => {
        if (!sessionRef || !window.playerSlot) return;
        try {
            const payload = {
                uid: userId,
                x: player.x,
                y: player.y,
                angle: player.angle,
                speed: player.speed,
                color: player.color,
                lastUpdate: Date.now()
            };
            const updateObj = {};
            updateObj[window.playerSlot] = payload;
            await update(sessionRef, updateObj);
        } catch (err) {
            console.error('Error writing multiplayer state:', err);
        }
    };

    writeData();

    window.multiplayerUpdateInterval = setInterval(() => {
        if (document.getElementById('gameOverlay') && !document.getElementById('gameOverlay').classList.contains('hidden')) return;
        writeData();
    }, MULTIPLAYER_WRITE_MS);
}

function stopMultiplayerUpdates() {
    if (window.multiplayerUpdateInterval) {
        clearInterval(window.multiplayerUpdateInterval);
        window.multiplayerUpdateInterval = null;
    }
}

// Periodic check: if opponent hasn't been seen for long, clear opponentState
setInterval(() => {
    if (window.isMultiplayer && window.opponentState && performance.now() - window.opponentLastSeen > OPPONENT_TIMEOUT_MS) {
        window.opponentState = null;
    }
}, 1000);