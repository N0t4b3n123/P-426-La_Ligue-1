<script setup>
import { computed, ref } from "vue";
import { roundName } from "../data/brackets.js";
import { SPECTATOR_STATUSES, spectatorStatus } from "../data/matches.js";
import { STATUSES } from "../data/tournaments.js";

// Read-only public view: no login required, no input, no action.
const props = defineProps({
  tournaments: { type: Array, required: true },
});

const selectedId = ref(null);

// Default: first tournament that already has a bracket.
const selected = computed(
  () =>
    props.tournaments.find((t) => t.id === selectedId.value) ??
    props.tournaments.find((t) => t.bracket) ??
    props.tournaments[0] ??
    null,
);

const champion = computed(() => {
  const rounds = selected.value?.bracket?.rounds;
  const final = rounds?.[rounds.length - 1]?.[0];
  return final?.status === "finished" ? final.winner : null;
});

function isWinner(match, team) {
  return (
    match.status === "finished" &&
    !!team &&
    match.winner?.registrationId === team.registrationId
  );
}
</script>

<template>
  <section class="panel" aria-labelledby="spectator-title">
    <h2 id="spectator-title">Tournament bracket</h2>

    <p v-if="!selected" class="empty">No tournaments yet.</p>

    <template v-else>
      <label v-if="tournaments.length > 1" class="picker">
        Tournament
        <select
          :value="selected.id"
          @change="selectedId = Number($event.target.value)"
        >
          <option v-for="t in tournaments" :key="t.id" :value="t.id">
            {{ t.name }}
          </option>
        </select>
      </label>

      <p class="meta">
        <strong>{{ selected.name }}</strong> — {{ selected.game }} ·
        {{ selected.date }} · {{ STATUSES[selected.status] }}
      </p>

      <p v-if="!selected.bracket" class="empty">
        The bracket has not been generated yet. Come back once registrations
        are closed.
      </p>

      <template v-else>
        <p v-if="champion" class="champion">
          🏆 Champion: <strong>{{ champion.name }}</strong>
        </p>

        <p class="swipe-hint">Swipe sideways to see the next rounds →</p>

        <div
          class="rounds"
          role="region"
          aria-label="Bracket rounds"
          aria-live="polite"
          tabindex="0"
        >
          <div
            v-for="(round, roundIndex) in selected.bracket.rounds"
            :key="roundIndex"
            class="round"
          >
            <h3>
              {{ roundName(roundIndex + 1, selected.bracket.rounds.length) }}
            </h3>

            <article
              v-for="m in round"
              :key="m.id"
              class="match"
              :class="`is-${spectatorStatus(m)}`"
            >
              <div class="match-title">
                <span>Match {{ m.index + 1 }}</span>
                <span class="badge" :class="`badge-${spectatorStatus(m)}`">
                  {{ SPECTATOR_STATUSES[spectatorStatus(m)] }}
                </span>
              </div>

              <div
                class="team"
                :class="{ winner: isWinner(m, m.team1), tbd: !m.team1 }"
              >
                <span class="name">{{ m.team1?.name ?? "TBD" }}</span>
                <span class="score">{{ m.score1 ?? "–" }}</span>
              </div>

              <div
                class="team"
                :class="{ winner: isWinner(m, m.team2), tbd: !m.team2 || m.bye }"
              >
                <span class="name">
                  {{ m.bye ? "BYE" : (m.team2?.name ?? "TBD") }}
                </span>
                <span class="score">{{ m.bye ? "" : (m.score2 ?? "–") }}</span>
              </div>

              <p v-if="isWinner(m, m.team1) || isWinner(m, m.team2)" class="winner-line">
                Winner: {{ m.winner.name }}
              </p>
            </article>
          </div>
        </div>
      </template>
    </template>
  </section>
</template>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 320px;
  margin-bottom: 0.75rem;
  color: var(--text-soft);
  font-size: 0.9rem;
}
.picker select {
  font: inherit;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: var(--field);
  color: var(--text);
}

.meta {
  margin: 0 0 0.75rem;
  color: var(--text-soft);
}

.champion {
  margin: 0 0 0.75rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--success-border);
  border-radius: 8px;
  background: var(--success-bg);
  color: var(--success);
}

.swipe-hint {
  display: none;
  margin: 0 0 0.5rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.rounds {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.75rem;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
}
.rounds:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.round {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 0.75rem;
  flex: 0 0 240px;
  scroll-snap-align: start;
}
.round h3 {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-soft);
}

.match {
  border: 1px solid var(--border-strong);
  border-left-width: 4px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--field);
}
.match.is-finished { border-left-color: var(--success); }
.match.is-in_progress { border-left-color: var(--accent); }
.match.is-upcoming { border-left-color: var(--border-strong); }
.match.is-bye { border-left-color: var(--text-muted); }

.match-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid var(--border);
  color: var(--text-soft);
  font-size: 0.8rem;
}

/* The status is always written, colour is only a reinforcement. */
.badge {
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  font-weight: 600;
  white-space: nowrap;
}
.badge-finished { color: var(--success); border-color: var(--success-border); background: var(--success-bg); }
.badge-in_progress { color: var(--accent-text); border-color: var(--accent); background: var(--accent-soft); }
.badge-bye { color: var(--text-muted); }

.team {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.5rem;
  align-items: center;
  min-height: 40px;
  padding: 0.4rem 0.6rem;
}
.team + .team { border-top: 1px solid var(--border); }
.team.tbd { color: var(--text-muted); font-style: italic; }
.name { overflow-wrap: anywhere; }
.score {
  min-width: 1.5rem;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.team.winner { color: var(--success); font-weight: 700; }
.team.winner .name::after { content: " ✓"; }

.winner-line {
  margin: 0;
  padding: 0.4rem 0.6rem;
  border-top: 1px solid var(--border);
  color: var(--success);
  font-size: 0.8rem;
}

@media (max-width: 640px) {
  .swipe-hint { display: block; }
  /* One round almost fills the screen: names and scores stay readable. */
  .round { flex-basis: 85%; scroll-snap-align: center; }
  .rounds { scroll-snap-type: x mandatory; gap: 1rem; }
  .team { min-height: 44px; font-size: 1rem; }
}
</style>
