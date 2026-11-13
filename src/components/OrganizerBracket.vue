<script setup>
import { reactive, ref, watchEffect } from "vue";
import {
  bracketBlocker,
  generateBracket,
  roundName,
  validatedRegistrations,
} from "../data/brackets.js";
import { MATCH_STATUSES, saveBracketMatchScore } from "../data/matches.js";

const props = defineProps({
  tournaments: { type: Array, required: true },
  registrations: { type: Array, required: true },
  account: { type: Object, required: true },
});

const emit = defineEmits(["generated"]);

const errors = ref({});
const successes = ref({});
const pendingConfirmId = ref(null);
const scoreDrafts = reactive({});

function validatedCount(t) {
  return validatedRegistrations(props.registrations, t.id).length;
}

function scoreKey(t, match) {
  return `${t.id}:${t.bracket?.generatedAt ?? "no-bracket"}:${match.id}`;
}

watchEffect(() => {
  for (const t of props.tournaments) {
    if (!t.bracket) continue;

    for (const round of t.bracket.rounds) {
      for (const match of round) {
        const key = scoreKey(t, match);

        if (!scoreDrafts[key]) {
          scoreDrafts[key] = {
            score1: match.score1 ?? "",
            score2: match.score2 ?? "",
          };
        }
      }
    }
  }
});

function generate(t, confirmed = false) {
  errors.value[t.id] = "";
  successes.value[t.id] = "";

  const result = generateBracket(t, props.registrations, props.account, {
    confirmed,
  });

  if (result.needsConfirmation) {
    pendingConfirmId.value = t.id;
    return;
  }

  if (!result.ok) {
    errors.value[t.id] = result.error;
    return;
  }

  pendingConfirmId.value = null;
  emit("generated", { tournamentId: t.id, bracket: result.bracket });
  successes.value[t.id] = confirmed
    ? "Bracket regenerated. Registrations stay closed."
    : "Bracket generated. Registrations are now closed.";
}

/** True if at least one score was already entered (a regeneration would erase it). */
function hasPlayedMatches(t) {
  return !!t.bracket?.rounds.some((round) =>
    round.some((m) => m.status === "finished"),
  );
}

function submitScore(t, match) {
  errors.value[t.id] = "";
  successes.value[t.id] = "";

  const draft = scoreDrafts[scoreKey(t, match)];

  const result = saveBracketMatchScore(
    t.bracket,
    match.id,
    draft.score1,
    draft.score2,
  );

  if (!result.ok && result.tie) {
    alert(result.error);
    errors.value[t.id] =
      "Draw detected. This match must be handled by the special-case flow (US-11).";
    return;
  }

  if (!result.ok) {
    errors.value[t.id] = result.error;
    return;
  }

  draft.score1 = match.score1;
  draft.score2 = match.score2;

  successes.value[t.id] =
    `${result.winner.name} wins ${match.score1}-${match.score2} and advances automatically.`;
}
</script>

<template>
  <section class="panel">
    <h2>Brackets</h2>
    <p v-if="tournaments.length === 0" class="empty">No tournaments yet.</p>

    <ul v-else class="bracket-list">
      <li v-for="t in tournaments" :key="t.id" class="bracket-card">
        <div class="bracket-header">
          <div>
            <strong>{{ t.name }}</strong>
            <p>{{ validatedCount(t) }} validated team(s)</p>
          </div>

          <button
            class="button"
            type="button"
            :disabled="!t.bracket && bracketBlocker(t, registrations) !== null"
            @click="generate(t)"
          >
            {{ t.bracket ? "Regenerate bracket" : "Generate bracket" }}
          </button>
        </div>

        <p v-if="!t.bracket && bracketBlocker(t, registrations)" class="hint">
          {{ bracketBlocker(t, registrations) }}
        </p>

        <p v-if="errors[t.id]" class="error" role="alert">
          {{ errors[t.id] }}
        </p>

        <p v-if="successes[t.id]" class="success">
          {{ successes[t.id] }}
        </p>

        <div v-if="pendingConfirmId === t.id" class="warning" role="alert">
          <p>
            <strong>Warning:</strong> a new draw will replace the current
            bracket. This cannot be undone.
            <template v-if="hasPlayedMatches(t)">
              Scores already entered will be lost.
            </template>
          </p>
          <div class="actions">
            <button
              class="button button-danger"
              type="button"
              @click="generate(t, true)"
            >
              Yes, regenerate
            </button>
            <button
              class="button button-ghost"
              type="button"
              @click="pendingConfirmId = null"
            >
              Cancel
            </button>
          </div>
        </div>

        <template v-if="t.bracket">
          <p class="meta">
            {{ t.bracket.teamCount }} teams · {{ t.bracket.byeCount }} bye(s) ·
            registrations closed
          </p>

          <div class="rounds">
            <div
              v-for="(round, roundIndex) in t.bracket.rounds"
              :key="roundIndex"
              class="round"
            >
              <h3>
                {{ roundName(roundIndex + 1, t.bracket.rounds.length) }}
              </h3>

              <div v-for="m in round" :key="m.id" class="match">
                <div class="match-title">
                  <span>Match {{ m.index + 1 }}</span>
                  <span class="match-status">
                    {{ MATCH_STATUSES[m.status] ?? "Not played" }}
                  </span>
                </div>

                <div class="score-slot">
                  <span
                    :class="{
                      winner:
                        m.winner?.registrationId === m.team1?.registrationId,
                    }"
                  >
                    {{ m.team1?.name ?? "TBD" }}
                  </span>

                  <input
                    v-if="m.team1 && m.team2 && !m.bye"
                    v-model.number="scoreDrafts[scoreKey(t, m)].score1"
                    type="number"
                    min="0"
                    step="1"
                    aria-label="Team 1 score"
                  />
                </div>

                <div class="score-slot" :class="{ bye: m.bye }">
                  <span
                    :class="{
                      winner:
                        m.winner?.registrationId === m.team2?.registrationId,
                    }"
                  >
                    {{ m.bye ? "BYE" : (m.team2?.name ?? "TBD") }}
                  </span>

                  <input
                    v-if="m.team1 && m.team2 && !m.bye"
                    v-model.number="scoreDrafts[scoreKey(t, m)].score2"
                    type="number"
                    min="0"
                    step="1"
                    aria-label="Team 2 score"
                  />
                </div>

                <div v-if="m.team1 && m.team2 && !m.bye" class="score-actions">
                  <button
                    class="button score-button"
                    type="button"
                    @click="submitScore(t, m)"
                  >
                    {{
                      m.status === "finished"
                        ? "Update score"
                        : "Validate score"
                    }}
                  </button>
                </div>

                <p v-else-if="!m.bye" class="waiting">
                  Waiting for qualified teams
                </p>

                <p
                  v-if="m.winner && m.status === 'finished'"
                  class="winner-line"
                >
                  Winner: {{ m.winner.name }}
                </p>

                <details v-if="m.history?.length" class="history">
                  <summary>Score history ({{ m.history.length }})</summary>
                  <ul>
                    <li v-for="change in m.history" :key="change.changedAt">
                      {{ change.oldScore1 }}-{{ change.oldScore2 }} →
                      {{ change.newScore1 }}-{{ change.newScore2 }} ·
                      {{ new Date(change.changedAt).toLocaleString() }}
                    </li>
                  </ul>
                </details>
              </div>
            </div>
          </div>
        </template>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.bracket-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.bracket-card {
  padding: 1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}

.bracket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.bracket-header p,
.meta,
.hint {
  margin: 0.25rem 0 0;
  color: var(--text-soft);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-danger {
  background: var(--error);
}

.warning {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--error);
  border-radius: 8px;
}

.warning p {
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.rounds {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.round {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 0.75rem;
  min-width: 230px;
}

.round h3 {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-soft);
}

.match {
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  overflow: hidden;
  background: var(--field);
}

.match-title {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid var(--border);
  color: var(--text-soft);
  font-size: 0.8rem;
}

.match-status {
  white-space: nowrap;
}

.score-slot {
  min-height: 38px;
  padding: 0.4rem 0.6rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 58px;
  gap: 0.5rem;
  align-items: center;
}

.score-slot + .score-slot {
  border-top: 1px solid var(--border);
}

.score-slot input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.3rem 0.4rem;
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
}

.score-slot.bye {
  color: var(--text-muted);
  font-style: italic;
}

.winner {
  color: var(--success);
  font-weight: 700;
}

.score-actions {
  padding: 0.5rem 0.6rem;
  border-top: 1px solid var(--border);
}

.score-button {
  width: 100%;
}

.waiting,
.winner-line {
  margin: 0;
  padding: 0.45rem 0.6rem;
  border-top: 1px solid var(--border);
  font-size: 0.8rem;
}

.waiting {
  color: var(--text-muted);
}

.winner-line,
.success {
  color: var(--success);
}

.history {
  padding: 0.5rem 0.6rem;
  border-top: 1px solid var(--border);
  color: var(--text-soft);
  font-size: 0.8rem;
}

.history ul {
  margin-bottom: 0;
  padding-left: 1.25rem;
}

.error {
  color: var(--error);
}

@media (max-width: 640px) {
  .bracket-header {
    flex-direction: column;
  }
}
</style>
