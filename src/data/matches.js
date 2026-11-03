export const MATCH_STATUSES = {
  pending: "Not played",
  finished: "Finished",
};

export const testPredictions = [];

export function saveMatchScore(matches, matchId, score1, score2) {
  const match = matches.find((m) => m.id === matchId);

  if (!match) {
    return {
      ok: false,
      error: "Match not found.",
    };
  }

  const firstScore = Number(score1);
  const secondScore = Number(score2);

  if (
    !Number.isInteger(firstScore) ||
    !Number.isInteger(secondScore) ||
    firstScore < 0 ||
    secondScore < 0
  ) {
    return {
      ok: false,
      error: "Scores must be positive whole numbers.",
    };
  }

  if (firstScore === secondScore) {
    return {
      ok: false,
      tie: true,
      error: "A draw is not allowed for this match.",
    };
  }

  const oldResult =
    match.status === "finished"
      ? {
          score1: match.score1,
          score2: match.score2,
          winner: match.winner,
        }
      : null;

  const winner = firstScore > secondScore ? match.team1 : match.team2;

  // If the score already existed, save the modification in history
  if (oldResult) {
    match.history.push({
      changedAt: new Date().toISOString(),

      oldScore1: oldResult.score1,
      oldScore2: oldResult.score2,
      oldWinner: oldResult.winner,

      newScore1: firstScore,
      newScore2: secondScore,
      newWinner: winner,
    });
  }

  match.score1 = firstScore;
  match.score2 = secondScore;
  match.status = "finished";
  match.winner = winner;

  // Automatically qualify the winner for the next match
  if (match.nextMatchId && match.nextMatchSlot) {
    const nextMatch = matches.find((m) => m.id === match.nextMatchId);

    if (nextMatch) {
      nextMatch[match.nextMatchSlot] = winner;

      // If an old result is modified and changes the winner,
      // the next match result must be reset.
      if (
        oldResult &&
        oldResult.winner !== winner &&
        nextMatch.status === "finished"
      ) {
        nextMatch.score1 = null;
        nextMatch.score2 = null;
        nextMatch.status = "pending";
        nextMatch.winner = null;
      }
    }
  }

  return {
    ok: true,
    winner,
  };
}

export function buildStandings(matches) {
  const standings = new Map();

  function ensureTeam(team) {
    if (!team) {
      return;
    }

    if (!standings.has(team)) {
      standings.set(team, {
        team,
        played: 0,
        wins: 0,
        losses: 0,
        points: 0,
      });
    }
  }

  for (const match of matches) {
    ensureTeam(match.team1);
    ensureTeam(match.team2);

    if (match.status !== "finished") {
      continue;
    }

    const team1 = standings.get(match.team1);
    const team2 = standings.get(match.team2);

    team1.played += 1;
    team2.played += 1;

    if (match.winner === match.team1) {
      team1.wins += 1;
      team1.points += 3;
      team2.losses += 1;
    } else {
      team2.wins += 1;
      team2.points += 3;
      team1.losses += 1;
    }
  }

  return [...standings.values()].sort(
    (a, b) =>
      b.points - a.points || b.wins - a.wins || a.team.localeCompare(b.team),
  );
}

export function recalculatePredictionPoints(predictions, match) {
  if (match.status !== "finished") {
    return;
  }

  for (const prediction of predictions) {
    if (prediction.matchId !== match.id) {
      continue;
    }

    const predictedWinner =
      prediction.score1 > prediction.score2 ? match.team1 : match.team2;

    prediction.points = predictedWinner === match.winner ? 1 : 0;
  }
}
