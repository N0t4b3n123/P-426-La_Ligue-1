export const MATCH_STATUSES = {
  pending: "Not played",
  finished: "Finished",
  bye: "Bye",
};

function sameTeam(a, b) {
  if (!a || !b) return false;

  return a.registrationId === b.registrationId;
}

function clearMatchResult(match) {
  match.score1 = null;
  match.score2 = null;
  match.status = "pending";
  match.winner = null;
}

function invalidateDownstream(bracket, roundIndex, matchIndex) {
  const round = bracket.rounds[roundIndex];
  const match = round?.[matchIndex];

  if (!match || match.status !== "finished") {
    return;
  }

  const oldWinner = match.winner;

  clearMatchResult(match);

  const nextRound = bracket.rounds[roundIndex + 1];

  if (!nextRound || !oldWinner) {
    return;
  }

  const nextMatchIndex = Math.floor(matchIndex / 2);
  const nextMatch = nextRound[nextMatchIndex];

  if (!nextMatch) {
    return;
  }

  const slot = matchIndex % 2 === 0 ? "team1" : "team2";

  if (sameTeam(nextMatch[slot], oldWinner)) {
    nextMatch[slot] = null;
  }

  if (nextMatch.status === "finished") {
    invalidateDownstream(bracket, roundIndex + 1, nextMatchIndex);
  }
}

export function saveBracketMatchScore(bracket, matchId, score1, score2) {
  let match = null;
  let roundIndex = -1;
  let matchIndex = -1;

  for (let r = 0; r < bracket.rounds.length; r++) {
    const index = bracket.rounds[r].findIndex((m) => m.id === matchId);

    if (index !== -1) {
      match = bracket.rounds[r][index];
      roundIndex = r;
      matchIndex = index;
      break;
    }
  }

  if (!match) {
    return {
      ok: false,
      error: "Match not found.",
    };
  }

  if (!match.team1 || !match.team2 || match.bye) {
    return {
      ok: false,
      error: "Both teams must be qualified before entering a score.",
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

  if (oldResult) {
    match.history ??= [];

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

  if (oldResult?.winner && !sameTeam(oldResult.winner, winner)) {
    const nextRound = bracket.rounds[roundIndex + 1];

    if (nextRound) {
      const nextMatchIndex = Math.floor(matchIndex / 2);

      const nextMatch = nextRound[nextMatchIndex];

      const slot = matchIndex % 2 === 0 ? "team1" : "team2";

      if (nextMatch && sameTeam(nextMatch[slot], oldResult.winner)) {
        nextMatch[slot] = null;
      }

      if (nextMatch?.status === "finished") {
        invalidateDownstream(bracket, roundIndex + 1, nextMatchIndex);
      }
    }
  }

  match.score1 = firstScore;
  match.score2 = secondScore;
  match.status = "finished";
  match.winner = winner;

  const nextRound = bracket.rounds[roundIndex + 1];

  if (nextRound) {
    const nextMatch = nextRound[Math.floor(matchIndex / 2)];

    const slot = matchIndex % 2 === 0 ? "team1" : "team2";

    if (nextMatch) {
      nextMatch[slot] = winner;
    }
  }

  return {
    ok: true,
    winner,
  };
}
