// US Spectator — Consulter le classement des pronostics
// Lancer avec : npm test   (node:test, aucune dépendance)
// BDD 4 (public) : la vue n'exige aucun compte, vérifié dans le navigateur (voir revue).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBracket } from "../data/brackets.js";
import { saveBracketMatchScore } from "../data/matches.js";
import { savePrediction } from "../data/predictions.js";
import { calculatePredictionRanking } from "../data/predictionRanking.js";

const names = { 3: "Sam", 4: "Léa", 5: "Noah" };
const getUserName = (id) => names[id];
const spectator = (id) => ({ id, role: "spectator" });

// 4 équipes : 2 demi-finales + 1 finale
function fixture() {
  const tournament = {
    id: 7,
    bracket: buildBracket([
      { id: 11, teamName: "Team A" },
      { id: 12, teamName: "Team B" },
      { id: 13, teamName: "Team C" },
      { id: 14, teamName: "Team D" },
    ]),
  };
  const [semi1, semi2] = tournament.bracket.rounds[0];
  return { tournament, tournaments: [tournament], semi1, semi2, predictions: [] };
}

// userId parie sur team1 ("t1") ou team2 ("t2") du match
function bet(f, userId, match, side) {
  const team = side === "t1" ? match.team1 : match.team2;
  const r = savePrediction(f.predictions, f.tournament, match, spectator(userId), team.registrationId);
  assert.equal(r.ok, true);
}
const rank = (f, opts = {}) =>
  calculatePredictionRanking(f.predictions, f.tournaments, { getUserName, ...opts });

test("BDD 1 — tous les participants, triés par points décroissants", () => {
  const f = fixture();
  bet(f, 3, f.semi1, "t1"); bet(f, 3, f.semi2, "t1"); // Sam : 2 bons
  bet(f, 4, f.semi1, "t1"); bet(f, 4, f.semi2, "t2"); // Léa : 1 bon
  bet(f, 5, f.semi1, "t2"); bet(f, 5, f.semi2, "t2"); // Noah : 0 bon
  saveBracketMatchScore(f.tournament.bracket, f.semi1.id, 2, 0); // team1 gagne
  saveBracketMatchScore(f.tournament.bracket, f.semi2.id, 3, 1); // team1 gagne

  const r = rank(f);
  assert.deepEqual(r.map((x) => x.name), ["Sam", "Léa", "Noah"]);
  assert.deepEqual(r.map((x) => x.points), [2, 1, 0]);
  assert.deepEqual(r.map((x) => x.rank), [1, 2, 3]);
});

test("BDD 2 — pronostics corrects / total pour chaque participant", () => {
  const f = fixture();
  bet(f, 3, f.semi1, "t1"); bet(f, 3, f.semi2, "t2");
  saveBracketMatchScore(f.tournament.bracket, f.semi1.id, 2, 0);
  saveBracketMatchScore(f.tournament.bracket, f.semi2.id, 3, 1); // Sam rate la 2e

  const [sam] = rank(f);
  assert.equal(sam.correct, 1);
  assert.equal(sam.total, 2);
  assert.equal(sam.points, 1);
});

test("Un pronostic sur un match non terminé est compté « en attente », sans points", () => {
  const f = fixture();
  bet(f, 3, f.semi1, "t1"); bet(f, 3, f.semi2, "t1");
  saveBracketMatchScore(f.tournament.bracket, f.semi1.id, 2, 0);

  const [sam] = rank(f);
  assert.equal(sam.total, 1);
  assert.equal(sam.pending, 1);
  assert.equal(sam.points, 1);
});

test("BDD 3 — égalité de points : le meilleur taux de réussite passe devant", () => {
  const f = fixture();
  // Sam : 1 bon sur 1 ; Léa : 1 bon sur 2 → même nombre de points (1)
  bet(f, 3, f.semi1, "t1");
  bet(f, 4, f.semi1, "t1"); bet(f, 4, f.semi2, "t2");
  saveBracketMatchScore(f.tournament.bracket, f.semi1.id, 2, 0);
  saveBracketMatchScore(f.tournament.bracket, f.semi2.id, 3, 1);

  const r = rank(f);
  assert.deepEqual(r.map((x) => x.points), [1, 1]);
  assert.deepEqual(r.map((x) => x.name), ["Sam", "Léa"]); // Sam 1/1 > Léa 1/2
  assert.deepEqual(r.map((x) => x.rank), [1, 2]);
});

test("BDD 3 — encore à égalité après le départage : même rang (ex aequo)", () => {
  const f = fixture();
  bet(f, 3, f.semi1, "t1");
  bet(f, 4, f.semi1, "t1");
  saveBracketMatchScore(f.tournament.bracket, f.semi1.id, 2, 0);

  const r = rank(f);
  assert.deepEqual(r.map((x) => x.rank), [1, 1]);
  assert.deepEqual(r.map((x) => x.name), ["Léa", "Sam"]); // ordre alphabétique d'affichage
});

test("BDD 5 — le classement suit un nouveau score (et sa correction)", () => {
  const f = fixture();
  bet(f, 3, f.semi1, "t1");
  bet(f, 4, f.semi1, "t2");
  assert.deepEqual(rank(f).map((x) => x.points), [0, 0]); // rien de terminé

  saveBracketMatchScore(f.tournament.bracket, f.semi1.id, 2, 0); // team1 gagne
  let r = rank(f);
  assert.equal(r[0].name, "Sam");
  assert.equal(r[0].points, 1);

  saveBracketMatchScore(f.tournament.bracket, f.semi1.id, 0, 2); // l'organisateur corrige
  r = rank(f);
  assert.equal(r[0].name, "Léa");
  assert.equal(r[0].points, 1);
  assert.equal(r.find((x) => x.name === "Sam").points, 0);
});

test("Filtre par tournoi et pronostic devenu invalide ignoré", () => {
  const f = fixture();
  bet(f, 3, f.semi1, "t1");
  f.predictions.push({ userId: 4, tournamentId: 99, matchId: "r1-m1", teamRegistrationId: 11 }); // tournoi inconnu
  f.predictions.push({ userId: 5, tournamentId: 7, matchId: "r1-m1", teamRegistrationId: 999 }); // équipe absente du match
  assert.deepEqual(rank(f).map((x) => x.name), ["Sam"]);
  assert.deepEqual(rank(f, { tournamentId: 123 }), []);
  assert.deepEqual(calculatePredictionRanking([], [], { getUserName }), []);
});
