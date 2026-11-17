// US Spectator — Pronostiquer le vainqueur avant le début du match
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBracket } from "../data/brackets.js";
import { savePrediction, getPrediction } from "../data/predictions.js";
import { startBracketMatch, spectatorStatus } from "../data/matches.js";

const spectator = { id: 3, role: "spectator" };
const organizer = { id: 1, role: "organizer" };
function fixture() {
  const tournament = { id: 7, bracket: buildBracket([
    { id: 11, teamName: "Team A" }, { id: 12, teamName: "Team B" },
    { id: 13, teamName: "Team C" }, { id: 14, teamName: "Team D" },
  ]) };
  return { tournament, match: tournament.bracket.rounds[0][0], predictions: [] };
}

test("BDD 1 — un pronostic sur un match à venir est associé au compte", () => {
  const { tournament, match, predictions } = fixture();
  const result = savePrediction(predictions, tournament, match, spectator, match.team1.registrationId);
  assert.equal(result.ok, true);
  assert.equal(predictions.length, 1);
  assert.equal(predictions[0].userId, spectator.id);
  assert.equal(predictions[0].teamRegistrationId, match.team1.registrationId);
});

test("BDD 2 — un pronostic après le démarrage est refusé", () => {
  const { tournament, match, predictions } = fixture();
  startBracketMatch(tournament.bracket, match.id, organizer);
  const result = savePrediction(predictions, tournament, match, spectator, match.team1.registrationId);
  assert.equal(result.ok, false);
  assert.equal(predictions.length, 0);
});

test("BDD 3 — un pronostic sur un match terminé est refusé", () => {
  const { tournament, match, predictions } = fixture();
  match.status = "finished";
  const result = savePrediction(predictions, tournament, match, spectator, match.team1.registrationId);
  assert.equal(result.ok, false);
});

test("BDD 4 — le choix est modifiable avant le début et remplace l'ancien", () => {
  const { tournament, match, predictions } = fixture();
  savePrediction(predictions, tournament, match, spectator, match.team1.registrationId);
  const result = savePrediction(predictions, tournament, match, spectator, match.team2.registrationId);
  assert.equal(result.ok, true);
  assert.equal(result.updated, true);
  assert.equal(predictions.length, 1);
  assert.equal(getPrediction(predictions, spectator.id, tournament.id, match.id).teamRegistrationId, match.team2.registrationId);
});

test("BDD 5 — un deuxième enregistrement ne crée pas de doublon", () => {
  const { tournament, match, predictions } = fixture();
  savePrediction(predictions, tournament, match, spectator, match.team1.registrationId);
  savePrediction(predictions, tournament, match, spectator, match.team2.registrationId);
  assert.equal(predictions.length, 1);
});

test("BDD 6 — le modèle de pronostic est réservé au spectateur connecté", () => {
  const { tournament, match, predictions } = fixture();
  assert.equal(savePrediction(predictions, tournament, match, null, match.team1.registrationId).ok, false);
  assert.equal(savePrediction(predictions, tournament, match, organizer, match.team1.registrationId).ok, false);
});

test("Seul l'organisateur peut démarrer un match et le statut devient in_progress", () => {
  const { tournament, match } = fixture();
  assert.equal(startBracketMatch(tournament.bracket, match.id, spectator).ok, false);
  assert.equal(startBracketMatch(tournament.bracket, match.id, organizer).ok, true);
  assert.equal(match.started, true);
  assert.equal(spectatorStatus(match), "in_progress");
});
