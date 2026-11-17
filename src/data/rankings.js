export function calculateRanking(bracket) {
  if (!bracket?.rounds?.length) return [];

  const teams = new Map();

  // Récupérer toutes les équipes inscrites au bracket
  for (const match of bracket.rounds[0]) {
    for (const team of [match.team1, match.team2]) {
      if (!team) continue;

      teams.set(team.registrationId, {
        id: team.registrationId,
        name: team.name,
        roundReached: 1,
        eliminated: false,
        champion: false,
        goalsFor: 0,
        goalsAgainst: 0,
      });
    }
  }

  // Parcourir les tours et les matchs
  bracket.rounds.forEach((round, roundIndex) => {
    for (const match of round) {
      const t1 = teams.get(match.team1?.registrationId);
      const t2 = teams.get(match.team2?.registrationId);

      if (t1) {
        t1.roundReached = Math.max(t1.roundReached, roundIndex + 1);
      }
      if (t2) {
        t2.roundReached = Math.max(t2.roundReached, roundIndex + 1);
      }

      // Seuls les matchs terminés comptent pour les scores
      if (match.bye || match.status !== "finished" || !t1 || !t2) {
        continue;
      }

      if (!Number.isInteger(match.score1) || !Number.isInteger(match.score2)) {
        continue;
      }

      t1.goalsFor += match.score1;
      t1.goalsAgainst += match.score2;

      t2.goalsFor += match.score2;
      t2.goalsAgainst += match.score1;

      const loser = match.winner?.registrationId === t1.id ? t2 : t1;

      loser.eliminated = true;
    }
  });

  // Identifier le champion
  const final = bracket.rounds.at(-1)?.[0];

  if (final?.status === "finished" && final.winner) {
    const champion = teams.get(final.winner.registrationId);
    if (champion) champion.champion = true;
  }

  // Trier selon la progression puis la différence de buts
  const ranking = [...teams.values()]
    .map((team) => ({
      ...team,
      goalDifference: team.goalsFor - team.goalsAgainst,
    }))
    .sort(
      (a, b) =>
        Number(b.champion) - Number(a.champion) ||
        b.roundReached - a.roundReached ||
        Number(a.eliminated) - Number(b.eliminated) ||
        b.goalDifference - a.goalDifference ||
        a.name.localeCompare(b.name, "fr"),
    );

  // Attribuer les rangs, en conservant les ex aequo
  let currentRank = 0;

  return ranking.map((team, index) => {
    const previous = ranking[index - 1];

    if (
      !previous ||
      previous.champion !== team.champion ||
      previous.roundReached !== team.roundReached ||
      previous.eliminated !== team.eliminated ||
      previous.goalDifference !== team.goalDifference
    ) {
      currentRank = index + 1;
    }

    return { ...team, rank: currentRank };
  });
}
