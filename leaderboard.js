"use strict";

// ============================================================
//  leaderboard.js – načtení a správa historie výsledků
// ============================================================

// Spustí se po načtení stránky
document.addEventListener("DOMContentLoaded", loadLeaderboard);

// ============================================================
//  NAČTENÍ HISTORIE Z localStorage
// ============================================================
function loadLeaderboard() {
  const tbody = document.getElementById("history-body");
  const emptyMsg = document.getElementById("empty-msg");

  try {
    const raw = localStorage.getItem("ttt_history") || "[]";
    const history = JSON.parse(raw); // pole (Array) záznamů

    if (history.length === 0) {
      emptyMsg.style.display = "block";
      return;
    }

    emptyMsg.style.display = "none";

    // Zobraz od nejnovějšího (spread + reverse zachová původní pole)
    const reversed = [...history].reverse();

    // Cyklus – vytvoří řádek tabulky pro každý záznam (bezpečně – žádné innerHTML s uživatelskými daty)
    for (let i = 0; i < reversed.length; i++) {
      const entry = reversed[i];
      const tr = document.createElement("tr");

      // Pořadové číslo
      const tdNumber = document.createElement("td");
      tdNumber.textContent = (i + 1).toString();
      tr.appendChild(tdNumber);

      // Datum a čas
      const tdDate = document.createElement("td");
      tdDate.textContent = entry.date;
      tr.appendChild(tdDate);

      // Hráč X (s barvou)
      const tdX = document.createElement("td");
      tdX.textContent = entry.x;
      tdX.className = "x-color";
      tr.appendChild(tdX);

      // Hráč O (s barvou)
      const tdO = document.createElement("td");
      tdO.textContent = entry.o;
      tdO.className = "o-color";
      tr.appendChild(tdO);

      // Výsledek (může být zvýrazněn)
      const tdWinner = document.createElement("td");
      if (entry.winner === "Remíza") {
        const em = document.createElement("em");
        em.textContent = entry.winner;
        tdWinner.appendChild(em);
      } else if (entry.winner === entry.x) {
        tdWinner.textContent = entry.winner;
        tdWinner.className = "x-color";
      } else {
        tdWinner.textContent = entry.winner;
        tdWinner.className = "o-color";
      }
      tr.appendChild(tdWinner);

      tbody.appendChild(tr);
    }
  } catch (err) {
    // Ošetření chyby při parsování poškozených dat
    emptyMsg.textContent = "⚠️ Chyba při načítání výsledků: " + err.message;
    emptyMsg.style.display = "block";
    console.error(err);
  }
}

// ============================================================
//  SMAZÁNÍ CELÉ HISTORIE
// ============================================================
function clearHistory() {
  try {
    if (
      !confirm("Opravdu chceš smazat celou historii? Tuto akci nelze vrátit.")
    )
      return;

    localStorage.removeItem("ttt_history");

    // Vymaž tabulku a zobraz prázdnou zprávu
    document.getElementById("history-body").innerHTML = "";
    const emptyMsg = document.getElementById("empty-msg");
    emptyMsg.textContent =
      "Zatím žádné výsledky. Zahraj si nejdřív nějakou hru! 🎮";
    emptyMsg.style.display = "block";
  } catch (err) {
    alert("Nepodařilo se smazat historii: " + err.message);
  }
}
