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
  max-width: 420px;
}
label {
  margin-top: 0.6rem;
  font-weight: 600;
}
input {
  font: inherit;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}
fieldset {
  margin: 0.8rem 0 0;
  padding: 0;
  border: 0;
  display: grid;
  gap: 0.5rem;
}
legend {
  font-weight: 600;
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
.add,
.remove {
  font: inherit;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  padding: 0.5rem 0.75rem;
}
.add {
  justify-self: start;
}
.add:disabled,
.remove:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.hint,
.notice {
  color: var(--text-soft);
}
.success {
  color: var(--text);
  font-weight: 600;
}
form .button {
  margin-top: 1rem;
}
</style>
