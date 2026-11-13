// US Spectator — Consulter le bracket à jour
// Lancer avec : npm test   (node:test, aucune dépendance)
// BDD 5 (mobile) est visuel : à valider à la main (voir README / revue).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBracket, roundName } from "../data/brackets.js";
import {
  saveBracketMatchScore,
  spectatorStatus,
  SPECTATOR_STATUSES,
} from "../data/matches.js";
import { loadList, saveList, STORAGE_KEYS } from "../data/storage.js";

const teams = (n) =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, teamName: `Team ${i + 1}` }));

const allMatches = (b) => b.rounds.flat();

// Faux localStorage (on ne touche pas au vrai navigateur dans les tests)
const fakeStorage = () => {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
  };
};

test("BDD 1 — l'arborescence complète est disponible avec équipes, scores et statut", () => {
  const b = buildBracket(teams(8));
  assert.equal(b.rounds.length, 3); // quarts, demis, finale
  assert.deepEqual(b.rounds.map((r) => r.length), [4, 2, 1]);
  assert.equal(roundName(3, 3), "Final");
  for (const m of allMatches(b)) {
    assert.ok("team1" in m && "team2" in m, "équipes présentes dans le modèle");
    assert.ok("score1" in m && "score2" in m, "scores présents dans le modèle");
    assert.ok(spectatorStatus(m) in SPECTATOR_STATUSES, "statut affichable");
  }
});

test("BDD 2 — à venir / en cours / terminé", () => {
  const b = buildBracket(teams(4));
  const [semi1, semi2] = b.rounds[0];
  const final = b.rounds[1][0];

  assert.equal(spectatorStatus(semi1), "in_progress"); // 2 équipes connues, pas de score
  assert.equal(spectatorStatus(final), "upcoming"); // qualifiés pas encore connus

  saveBracketMatchScore(b, semi1.id, 2, 1);
  assert.equal(spectatorStatus(semi1), "finished");
  assert.equal(spectatorStatus(final), "upcoming"); // une seule équipe qualifiée

  saveBracketMatchScore(b, semi2.id, 0, 3);
  assert.equal(spectatorStatus(final), "in_progress"); // les 2 finalistes sont connus
});

test("BDD 2 — un bye est affiché comme tel (pas comme un match à jouer)", () => {
  const b = buildBracket(teams(3)); // 4 slots → 1 bye
  const byes = b.rounds[0].filter((m) => m.bye);
  assert.equal(byes.length, 1);
  assert.equal(spectatorStatus(byes[0]), "bye");
});

test("BDD 3 — un score validé met à jour score, statut et vainqueur du tour suivant", () => {
  const b = buildBracket(teams(4));
  const semi1 = b.rounds[0][0];
  const final = b.rounds[1][0];
  assert.equal(final.team1, null);

  const res = saveBracketMatchScore(b, semi1.id, 3, 1);
  assert.equal(res.ok, true);
  assert.equal(semi1.score1, 3);
  assert.equal(semi1.score2, 1);
  assert.equal(semi1.winner.registrationId, semi1.team1.registrationId);
  assert.equal(final.team1.registrationId, semi1.team1.registrationId); // qualifié
});

test("BDD 3 — un score invalide (égalité) ne modifie pas le bracket affiché", () => {
  const b = buildBracket(teams(4));
  const m = b.rounds[0][0];
  const res = saveBracketMatchScore(b, m.id, 2, 2);
  assert.equal(res.ok, false);
  assert.equal(m.score1, null);
  assert.equal(spectatorStatus(m), "in_progress");
});

test("BDD 4 — après rafraîchissement (rechargement du stockage), le score est toujours là", () => {
  const storage = fakeStorage();
  const tournament = { id: 1, name: "ETML Cup", status: "in_progress", bracket: buildBracket(teams(4)) };

  // L'organisateur saisit un score → l'app sauvegarde
  const semi1 = tournament.bracket.rounds[0][0];
  saveBracketMatchScore(tournament.bracket, semi1.id, 5, 2);
  saveList("tournaments", [tournament], storage);

  // "Refresh" : l'app relit le stockage
  const [reloaded] = loadList("tournaments", [], storage);
  const m = reloaded.bracket.rounds[0][0];
  assert.equal(m.score1, 5);
  assert.equal(m.score2, 2);
  assert.equal(spectatorStatus(m), "finished");
  assert.equal(reloaded.bracket.rounds[1][0].team1.name, m.winner.name);
});

test("Stockage — valeur par défaut si vide ou corrompu, pas de réécriture inutile", () => {
  const storage = fakeStorage();
  const fallback = [{ id: 9 }];
  assert.deepEqual(loadList("tournaments", fallback, storage), fallback);

  storage.setItem(STORAGE_KEYS.tournaments, "{pas du json");
  assert.deepEqual(loadList("tournaments", fallback, storage), fallback);

  storage.setItem(STORAGE_KEYS.tournaments, '{"pas":"un tableau"}');
  assert.deepEqual(loadList("tournaments", fallback, storage), fallback);

  let writes = 0;
  const counting = { ...storage, setItem: (k, v) => (writes++, storage.setItem(k, v)) };
  saveList("tournaments", [{ id: 1 }], counting);
  saveList("tournaments", [{ id: 1 }], counting);
  assert.equal(writes, 1);

  // un stockage indisponible ne fait pas planter l'app
  assert.deepEqual(loadList("tournaments", fallback, null), fallback);
  assert.doesNotThrow(() => saveList("tournaments", [], null));
});
