// US-04 — Générer le bracket par tirage au sort
// Lancer avec : npm test   (node:test, aucune dépendance)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateBracket,
  buildBracket,
  isPowerOfTwo,
} from "../data/brackets.js";
import { registrationState } from "../data/registrations.js";

const organizer = { id: 1, role: "organizer", name: "Alex" };
const captain = { id: 2, role: "captain", name: "Camille" };

// Inscriptions clôturées (deadline dépassée), statut encore "registration_open"
const closedTournament = () => ({
  id: 1,
  name: "ETML Cup",
  maxTeams: 16,
  status: "registration_open",
  registrationDeadline: "2020-01-01",
});

const teams = (n, status = "accepted") =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    tournamentId: 1,
    teamName: `Team ${i + 1}`,
    status,
  }));

// RNG déterministe (mulberry32)
const seeded = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const firstRoundTeamIds = (b) =>
  b.rounds[0]
    .flatMap((m) => [m.team1, m.team2])
    .filter(Boolean)
    .map((t) => t.registrationId);

test("BDD 1 — bracket créé avec toutes les équipes validées, tirage aléatoire", () => {
  const regs = teams(8);
  const res = generateBracket(closedTournament(), regs, organizer);
  assert.equal(res.ok, true);
  assert.equal(res.bracket.rounds[0].length, 4);
  assert.deepEqual(
    [...firstRoundTeamIds(res.bracket)].sort((a, b) => a - b),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );

  // Le tirage change selon le RNG (pas toujours le même ordre)
  const orders = new Set(
    [1, 2, 3, 4, 5].map((s) =>
      firstRoundTeamIds(
        buildBracket(
          regs.map((r) => r),
          seeded(s),
        ),
      ).join(","),
    ),
  );
  assert.ok(orders.size > 1, "le tirage doit varier");
});

test("BDD 1 — seules les équipes validées participent", () => {
  const regs = [
    ...teams(4),
    { id: 99, tournamentId: 1, teamName: "Refusée", status: "rejected" },
    {
      id: 98,
      tournamentId: 1,
      teamName: "En attente",
      status: "pending_validation",
    },
  ];
  const res = generateBracket(closedTournament(), regs, organizer);
  assert.equal(res.ok, true);
  const ids = firstRoundTeamIds(res.bracket);
  assert.equal(ids.length, 4);
  assert.ok(!ids.includes(99) && !ids.includes(98));
});

test("Minimum 2 équipes validées", () => {
  const res = generateBracket(closedTournament(), teams(1), organizer);
  assert.equal(res.ok, false);
  assert.match(res.error, /At least 2/);
  assert.equal(
    generateBracket(closedTournament(), teams(2), organizer).ok,
    true,
  );
  assert.equal(generateBracket(closedTournament(), [], organizer).ok, false);
});

test("BDD 2 — byes automatiques si pas une puissance de 2", () => {
  for (const n of [3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15]) {
    for (let seed = 1; seed <= 20; seed++) {
      const { bracket } = generateBracket(
        closedTournament(),
        teams(n),
        organizer,
        { rng: seeded(seed) },
      );
      const size = 2 ** Math.ceil(Math.log2(n));
      assert.equal(bracket.size, size);
      assert.equal(bracket.byeCount, size - n, `n=${n}`);
      const byes = bracket.rounds[0].filter((m) => m.bye);
      assert.equal(byes.length, size - n);
      // jamais deux byes dans le même match, aucune équipe perdue ni dupliquée
      assert.ok(bracket.rounds[0].every((m) => m.team1 !== null));
      assert.equal(new Set(firstRoundTeamIds(bracket)).size, n);
      // les équipes avec bye sont déjà au tour 2
      const r2 = bracket.rounds[1]
        .flatMap((m) => [m.team1, m.team2])
        .filter(Boolean);
      assert.equal(r2.length, byes.length);
    }
  }
});

test("BDD 2 — pas de bye si puissance de 2", () => {
  for (const n of [2, 4, 8, 16]) {
    assert.ok(isPowerOfTwo(n));
    const { bracket } = generateBracket(
      closedTournament(),
      teams(n),
      organizer,
    );
    assert.equal(bracket.byeCount, 0);
  }
});

test("Les byes sont répartis aléatoirement", () => {
  const positions = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    const b = buildBracket(teams(5), seeded(seed));
    positions.add(
      b.rounds[0].findIndex((m) => m.bye) +
        "/" +
        b.rounds[0].filter((m) => m.bye).length,
    );
  }
  assert.ok(positions.size > 1);
});

test("BDD 3 — inscriptions fermées après génération", () => {
  // Deadline dans le futur : impossible de générer (inscriptions encore ouvertes)
  const open = { ...closedTournament(), registrationDeadline: "2999-01-01" };
  assert.equal(generateBracket(open, teams(4), organizer).ok, false);

  const t = closedTournament();
  const res = generateBracket(t, teams(4), organizer);
  assert.equal(res.ok, true);
  // simule ce que fait App.vue (setBracket)
  t.bracket = res.bracket;
  t.status = "in_progress";
  assert.equal(registrationState(t, teams(4)), "closed");
});

test("Seul un organisateur peut générer", () => {
  const res = generateBracket(closedTournament(), teams(4), captain);
  assert.equal(res.ok, false);
});

test("Génération unique : une regénération demande une confirmation explicite", () => {
  const t = closedTournament();
  const regs = teams(4);
  t.bracket = generateBracket(t, regs, organizer).bracket;
  t.status = "in_progress";

  const again = generateBracket(t, regs, organizer);
  assert.equal(again.ok, false);
  assert.equal(again.needsConfirmation, true);

  const confirmed = generateBracket(t, regs, organizer, { confirmed: true });
  assert.equal(confirmed.ok, true);
});

test("Tournoi terminé : pas de génération", () => {
  const t = { ...closedTournament(), status: "finished" };
  assert.equal(
    generateBracket(t, teams(4), organizer, { confirmed: true }).ok,
    false,
  );
});
