"use strict";

// ============================================================
//  game.js – Piškvorky (Tic Tac Toe) – herní logika
// ============================================================

// ── Konstanty ────────────────────────────────────────────────
// Všechny vítězné kombinace (řady, sloupce, úhlopříčky)
const WINS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // řady
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // sloupce
  [0, 4, 8],
  [2, 4, 6], // úhlopříčky
];

// ── Stav hry ─────────────────────────────────────────────────
let board = Array(9).fill(""); // hrací pole (vestavěný objekt Array)
let currentPlayer = "X"; // aktuální hráč
let gameActive = false; // běží hra?
let vsAI = false; // mód hráč vs. počítač
let names = { X: "Hráč 1", O: "Hráč 2" };
let score = { X: 0, O: 0, D: 0 };

// ── Pomocná proměnná pro časovač AI ─────────────────────────
let aiTimeout = null;

// ── DOM reference ─────────────────────────────────────────────
const cells = document.querySelectorAll(".cell");
const statusEl = document.getElementById("status");
const scoreXEl = document.getElementById("score-x");
const scoreOEl = document.getElementById("score-o");
const scoreDEl = document.getElementById("score-d");
const nameXEl = document.getElementById("score-name-x");
const nameOEl = document.getElementById("score-name-o");

// ============================================================
//  VALIDACE – voláno při každém stisku klávesy (oninput)
// ============================================================
function validateName(input, errId) {
  const err = document.getElementById(errId);
  if (input.value.trim().length === 0) {
    input.classList.add("invalid");
    err.textContent = "Jméno nesmí být prázdné.";
  } else {
    input.classList.remove("invalid");
    err.textContent = "";
  }
}

// ============================================================
//  SPUŠTĚNÍ HRY
// ============================================================
function startGame() {
  const startBtn = document.getElementById("start-btn");

  try {
    startBtn.disabled = true; // zablokuj tlačítko během zpracování

    const p1 = document.getElementById("p1").value.trim();
    const mode = document.getElementById("mode").value;

    // ── Ošetření chyb (throw + catch) ────────────────────────
    if (p1.length === 0) throw new Error("Zadej jméno hráče 1!");
    if (p1.length > 20)
      throw new Error("Jméno hráče 1 je příliš dlouhé (max 20 znaků).");

    vsAI = mode === "ai";

    let p2 = "Počítač";
    if (!vsAI) {
      p2 = document.getElementById("p2").value.trim();
      if (p2.length === 0) throw new Error("Zadej jméno hráče 2!");
      if (p2.length > 20)
        throw new Error("Jméno hráče 2 je příliš dlouhé (max 20 znaků).");
      if (p1 === p2) throw new Error("Hráči musí mít různá jména.");
    }

    // Vše OK → inicializace
    names = { X: p1, O: p2 };
    score = { X: 0, O: 0, D: 0 };

    document.getElementById("error").textContent = "";
    document.getElementById("setup").style.display = "none";
    document.getElementById("game-area").style.display = "block";

    nameXEl.textContent = names.X;
    nameOEl.textContent = names.O;

    resetRound();
  } catch (err) {
    // Zobraz srozumitelnou hlášku uživateli
    document.getElementById("error").textContent = "⚠️ " + err.message;
  } finally {
    // Tlačítko vždy odblokuj (i při chybě)
    startBtn.disabled = false;
  }
}

// ============================================================
//  RESET KOLA (mřížka, hráč na tahu)
// ============================================================
function resetRound() {
  // Zruš čekající tah AI, pokud existuje
  if (aiTimeout) {
    clearTimeout(aiTimeout);
    aiTimeout = null;
  }

  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;

  // Vymaž všechna políčka
  cells.forEach(function (cell) {
    cell.textContent = "";
    cell.className = "cell";
  });

  setStatus("Na tahu: " + names[currentPlayer] + " (" + currentPlayer + ")");
}

// ============================================================
//  KLIK NA POLÍČKO (událost onclick v HTML)
// ============================================================
function handleClick(index) {
  if (!gameActive) return; // hra skončila
  if (board[index] !== "") return; // políčko obsazeno
  if (vsAI && currentPlayer === "O") return; // čekáme na AI

  makeMove(index, currentPlayer);
}

// ============================================================
//  PROVEDENÍ TAHU
// ============================================================
function makeMove(index, player) {
  board[index] = player;

  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase(), "taken");

  const winLine = checkWin(player);

  if (winLine) {
    // Hráč vyhrál
    endGame(player, winLine);
  } else if (
    board.every(function (v) {
      return v !== "";
    })
  ) {
    // Plná mřížka = remíza
    endGame(null, []);
  } else {
    // Přepni hráče
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    setStatus("Na tahu: " + names[currentPlayer] + " (" + currentPlayer + ")");

    // Pokud je na tahu AI, zavolej ji po krátkém zpoždění
    if (vsAI && currentPlayer === "O" && gameActive) {
      if (aiTimeout) clearTimeout(aiTimeout);
      aiTimeout = setTimeout(aiMove, 450);
    }
  }
}

// ============================================================
//  KONTROLA VÝHRY – prochází všechny vítězné kombinace
// ============================================================
function checkWin(player) {
  for (let i = 0; i < WINS.length; i++) {
    const line = WINS[i];
    if (
      board[line[0]] === player &&
      board[line[1]] === player &&
      board[line[2]] === player
    ) {
      return line;
    }
  }
  return null;
}

// ============================================================
//  UKONČENÍ HRY
// ============================================================
function endGame(winner, winLine) {
  gameActive = false;

  // Zruš čekající tah AI, pokud existuje (zabrání pozdnímu AI tahu)
  if (aiTimeout) {
    clearTimeout(aiTimeout);
    aiTimeout = null;
  }

  if (winner) {
    // Zvýrazni vítěznou linii
    winLine.forEach(function (i) {
      cells[i].classList.add("winner");
    });
    score[winner]++;
    setStatus("🎉 Vyhrál/a: " + names[winner] + "!");
  } else {
    score.D++;
    setStatus("🤝 Remíza!");
  }

  updateScoreDisplay();
  saveResult(winner);
}

// ============================================================
//  AI – jednoduchá strategie
// ============================================================
function aiMove() {
  // Po spuštění zrušíme uložený timeout, aby se dal spustit další
  aiTimeout = null;

  // Bezpečnostní kontrola – hra musí být aktivní
  if (!gameActive) return;

  try {
    // Všechna volná políčka (pole, cyklus)
    const empty = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") empty.push(i);
    }

    if (empty.length === 0) throw new Error("Žádné volné políčko.");

    // 1) Zkus vyhrát
    let move = findBestMove("O");
    // 2) Zablokuj hráče
    if (move === -1) move = findBestMove("X");
    // 3) Náhodný tah (Math.random, Math.floor – vestavěné objekty)
    if (move === -1) move = empty[Math.floor(Math.random() * empty.length)];

    makeMove(move, "O");
  } catch (err) {
    console.error("Chyba AI:", err.message);
  }
}

// Hledá tah, kde hráč `player` potřebuje jen jedno políčko k výhře
function findBestMove(player) {
  for (let i = 0; i < WINS.length; i++) {
    const line = WINS[i];
    let count = 0;
    let empty = -1;

    for (let j = 0; j < line.length; j++) {
      if (board[line[j]] === player) count++;
      else if (board[line[j]] === "") empty = line[j];
    }

    if (count === 2 && empty !== -1) return empty;
  }
  return -1;
}

// ============================================================
//  AKTUALIZACE SKÓRE NA STRÁNCE
// ============================================================
function updateScoreDisplay() {
  scoreXEl.textContent = score.X;
  scoreOEl.textContent = score.O;
  scoreDEl.textContent = score.D;
}

// ============================================================
//  ULOŽENÍ VÝSLEDKU DO localStorage (Date – vestavěný objekt)
// ============================================================
function saveResult(winner) {
  try {
    const history = JSON.parse(localStorage.getItem("ttt_history") || "[]");

    // Přidej nový záznam
    history.push({
      date: new Date().toLocaleString("cs-CZ"), // vestavěný objekt Date
      x: names.X,
      o: names.O,
      winner: winner ? names[winner] : "Remíza",
    });

    // Drž maximálně 100 záznamů
    if (history.length > 100) history.shift();

    localStorage.setItem("ttt_history", JSON.stringify(history));
  } catch (e) {
    // localStorage nemusí být dostupný (soukromý režim apod.)
    console.warn("Výsledek nelze uložit:", e.message);
  }
}

// ============================================================
//  POMOCNÉ FUNKCE
// ============================================================
function setStatus(msg) {
  statusEl.textContent = msg;
}

// Přepnutí viditelnosti pole pro hráče 2 podle módu (onchange)
function toggleP2(select) {
  const row = document.getElementById("p2-row");
  row.style.display = select.value === "ai" ? "none" : "block";
}

// Tlačítko "Nová hra" – zpět do nastavení
function newGame() {
  // Zruš čekající tah AI
  if (aiTimeout) {
    clearTimeout(aiTimeout);
    aiTimeout = null;
  }
  gameActive = false;
  document.getElementById("setup").style.display = "block";
  document.getElementById("game-area").style.display = "none";
  document.getElementById("p1").value = "";
  document.getElementById("p2").value = "";
  document.getElementById("error").textContent = "";
}
