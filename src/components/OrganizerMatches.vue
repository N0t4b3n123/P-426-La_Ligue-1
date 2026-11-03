<script setup>
import { computed, reactive, ref, watchEffect } from "vue";

import {
  MATCH_STATUSES,
  buildStandings,
  recalculatePredictionPoints,
  saveMatchScore,
} from "../data/matches.js";

const props = defineProps({
  bracket: {
    type: Object,
    required: true,
  },

  predictions: {
    type: Array,
    required: true,
  },
});

const matches = computed(() =>
  props.bracket.rounds.flatMap((round) => round.matches),
);

const scores = reactive({});

const error = ref("");
const success = ref("");

const specialCaseMatch = ref(null);

watchEffect(() => {
  for (const match of matches.value) {
    if (!scores[match.id]) {
      scores[match.id] = {
        score1: match.score1 ?? "",
        score2: match.score2 ?? "",
      };
    }
  }
});

const standings = computed(() => buildStandings(matches.value));

function submitScore(match) {
  error.value = "";
  success.value = "";

  if (!match.team1 || !match.team2) {
    error.value = "Both teams must be qualified before entering a score.";

    return;
  }

  const result = saveMatchScore(
    matches.value,
    match.id,
    scores[match.id].score1,
    scores[match.id].score2,
  );

  if (!result.ok && result.tie) {
    alert(result.error);

    specialCaseMatch.value = match;

    return;
  }

  if (!result.ok) {
    error.value = result.error;
    return;
  }

  recalculatePredictionPoints(props.predictions, match);

  scores[match.id].score1 = match.score1;
  scores[match.id].score2 = match.score2;

  success.value = `${match.label} saved. ${result.winner} advances.`;
}

function returnToMatches() {
  specialCaseMatch.value = null;
}
</script>

<template>
  <!-- Temporary US-11 screen -->
  <section v-if="specialCaseMatch" class="panel">
    <h2>Special case management</h2>

    <p class="error">
      The score for
      {{ specialCaseMatch.label }}
      is tied. This game does not allow a draw.
    </p>

    <p>
      This is the temporary US-11 screen. Resolve the special case before
      validating the match result.
    </p>

    <button type="button" class="button" @click="returnToMatches">
      Back to matches
    </button>
  </section>

  <template v-else>
    <section class="panel">
      <h2>Match scores</h2>

      <p v-if="success" class="success">
        {{ success }}
      </p>

      <p v-if="error" class="error" role="alert">
        {{ error }}
      </p>

      <div class="match-list">
        <article v-for="match in matches" :key="match.id" class="match-card">
          <div class="match-header">
            <div>
              <strong>
                {{ match.label }}
              </strong>

              <p>
                {{ MATCH_STATUSES[match.status] }}
              </p>
            </div>

            <span v-if="match.winner" class="winner">
              Winner: {{ match.winner }}
            </span>
          </div>

          <div class="score-row">
            <span>
              {{ match.team1 ?? "TBD" }}
            </span>

            <input
              v-model.number="scores[match.id].score1"
              type="number"
              min="0"
              step="1"
              :disabled="!match.team1 || !match.team2"
              aria-label="Team 1 score"
            />
          </div>

          <div class="score-row">
            <span>
              {{ match.team2 ?? "TBD" }}
            </span>

            <input
              v-model.number="scores[match.id].score2"
              type="number"
              min="0"
              step="1"
              :disabled="!match.team1 || !match.team2"
              aria-label="Team 2 score"
            />
          </div>

          <button
            type="button"
            class="button"
            :disabled="!match.team1 || !match.team2"
            @click="submitScore(match)"
          >
            {{
              match.status === "finished" ? "Update score" : "Validate score"
            }}
          </button>

          <details v-if="match.history.length" class="history">
            <summary>Score history ({{ match.history.length }})</summary>

            <ul>
              <li v-for="change in match.history" :key="change.changedAt">
                {{ change.oldScore1 }}-{{ change.oldScore2 }}
                →
                {{ change.newScore1 }}-{{ change.newScore2 }}

                ·

                {{ new Date(change.changedAt).toLocaleString() }}
              </li>
            </ul>
          </details>
        </article>
      </div>
    </section>

    <section class="panel">
      <h2>Standings</h2>

      <table class="standings">
        <thead>
          <tr>
            <th>Team</th>
            <th>Played</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Points</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="team in standings" :key="team.team">
            <td>{{ team.team }}</td>
            <td>{{ team.played }}</td>
            <td>{{ team.wins }}</td>
            <td>{{ team.losses }}</td>
            <td>{{ team.points }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </template>
</template>

<style scoped>
.match-list {
  display: grid;
  gap: 1rem;
}

.match-card {
  padding: 1rem 1.25rem;

  border: 1px solid var(--border);
  border-radius: 8px;

  background: var(--surface);
}

.match-header {
  display: flex;
  justify-content: space-between;

  gap: 1rem;

  margin-bottom: 1rem;
}

.match-header p {
  margin: 0.25rem 0 0;

  color: var(--text-soft);
}

.winner {
  color: var(--success);

  font-weight: 600;
}

.score-row {
  display: grid;

  grid-template-columns: 1fr 90px;

  gap: 1rem;

  align-items: center;

  margin-bottom: 0.5rem;
}

.score-row input {
  width: 100%;

  box-sizing: border-box;

  padding: 0.55rem 0.65rem;

  border: 1px solid var(--border-strong);
  border-radius: 6px;

  background: var(--field);

  color: var(--text);

  font: inherit;
}

.match-card > .button {
  margin-top: 0.75rem;
}

.history {
  margin-top: 1rem;

  color: var(--text-soft);
}

.history ul {
  margin-bottom: 0;
}

.standings {
  width: 100%;

  border-collapse: collapse;
}

.standings th,
.standings td {
  padding: 0.65rem;

  text-align: left;

  border-bottom: 1px solid var(--border);
}

.success {
  color: var(--success);
}

.error {
  color: var(--error);
}
</style>
