<script setup>
import { computed, ref } from "vue";
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  registerTeam,
  registrationState,
} from "../data/registrations.js";

const props = defineProps({
  tournament: { type: Object, required: true },
  registrations: { type: Array, required: true },
  account: { type: Object, required: true },
});
const emit = defineEmits(["registered"]);

const teamName = ref("");
const players = ref(["", ""]);
const error = ref("");
const success = ref("");

const state = computed(() =>
  registrationState(props.tournament, props.registrations),
);

function addPlayer() {
  if (players.value.length < MAX_PLAYERS) players.value.push("");
}

function removePlayer(index) {
  if (players.value.length > MIN_PLAYERS) players.value.splice(index, 1);
}

function submit() {
  success.value = "";
  const result = registerTeam(
    props.registrations,
    props.tournament,
    props.account,
    {
      teamName: teamName.value,
      players: players.value,
    },
  );
  if (!result.ok) {
    error.value = result.error;
    return;
  }
  emit("registered", result.registration);
  success.value = `Team "${result.registration.teamName}" registered. It is now pending validation.`;
  teamName.value = "";
  players.value = ["", ""];
  error.value = "";
}
</script>

<template>
  <section class="panel" aria-labelledby="register-title">
    <h2 id="register-title">Register a team: {{ tournament.name }}</h2>

    <p v-if="success" class="success" role="status">{{ success }}</p>

    <!-- Form hidden when registration is not possible -->
    <p v-if="state === 'closed'" class="notice">
      Registration is not open for this tournament.
    </p>
    <p v-else-if="state === 'deadline_passed'" class="notice">
      The registration deadline ({{ tournament.registrationDeadline }}) has
      passed.
    </p>
    <p v-else-if="state === 'full'" class="notice">
      This tournament is full ({{ tournament.maxTeams }} teams).
    </p>

    <form v-else @submit.prevent="submit" novalidate>
      <p class="hint">
        Registration open until {{ tournament.registrationDeadline }}.
      </p>

      <label for="team-name">Team name</label>
      <input id="team-name" v-model="teamName" type="text" autocomplete="off" />

      <fieldset>
        <legend>Players ({{ MIN_PLAYERS }} to {{ MAX_PLAYERS }})</legend>
        <div v-for="(_, i) in players" :key="i" class="player-row">
          <label :for="`player-${i}`" class="sr-only">Player {{ i + 1 }}</label>
          <input
            :id="`player-${i}`"
            v-model="players[i]"
            type="text"
            :placeholder="`Player ${i + 1}`"
            autocomplete="off"
          />
          <button
            v-if="i >= MIN_PLAYERS"
            type="button"
            class="remove"
            :aria-label="`Remove player ${i + 1}`"
            @click="removePlayer(i)"
          >
            ✕
          </button>
        </div>
        <button
          v-if="players.length < MAX_PLAYERS"
          type="button"
          class="add"
          @click="addPlayer"
        >
          + Add a player
        </button>
      </fieldset>

      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <button type="submit" class="button">Register my team</button>
    </form>
  </section>
</template>

<style scoped>
form {
  display: grid;
  gap: 0.4rem;
  max-width: 440px;
}
label {
  margin-top: 0.6rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
}
input {
  font: inherit;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-strong);
  background: var(--field);
  color: var(--text);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);
  transition: border-color 0.15s, box-shadow 0.15s;
}
input::placeholder {
  color: var(--text-muted);
}
input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.35);
}
form .button {
  margin-top: 1rem;
  justify-self: start;
}
fieldset {
  margin: 0.8rem 0 0;
  padding: 0;
  border: 0;
  display: grid;
  gap: 0.5rem;
}
legend {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
}
.player-row {
  display: grid;
  grid-template-columns: 1fr 2.6rem;
  gap: 0.5rem;
}
.player-row label {
  margin: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
.add {
  justify-self: start;
  font: inherit;
  font-weight: 600;
  padding: 0.25rem 0;
  border: 0;
  background: none;
  color: var(--accent-text);
  cursor: pointer;
}
.add:hover {
  text-decoration: underline;
}
.remove {
  font: inherit;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid var(--border-strong);
  background: var(--field);
  color: var(--text-soft);
  transition: color 0.15s, border-color 0.15s;
}
.remove:hover {
  color: var(--error);
  border-color: var(--error);
}
.hint {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.9rem;
}
.notice {
  margin: 0;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-soft);
  color: var(--text-soft);
}
.success {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--success-border);
  border-radius: 6px;
  background: var(--success-bg);
  color: var(--success);
  font-weight: 500;
}
</style>
