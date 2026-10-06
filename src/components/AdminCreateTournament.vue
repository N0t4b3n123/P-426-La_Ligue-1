<script setup>
import { ref } from "vue";

const emit = defineEmits(["created"]);

const MAX_TEAMS_LIMIT = 8;

const name = ref("");
const game = ref("");
const date = ref("");
const maxTeams = ref(8);
const error = ref("");
const registrationDeadline = ref("");

function submit() {
  if (
    !name.value.trim() ||
    !game.value.trim() ||
    !date.value ||
    !registrationDeadline.value
  ) {
    error.value = "Name, game, date and registration deadline are required.";
    return;
  }
  if (registrationDeadline.value >= date.value) {
    error.value =
      "The registration deadline must be before the tournament date.";
    return;
  }
  if (maxTeams.value < 2 || maxTeams.value > MAX_TEAMS_LIMIT) {
    error.value = `The number of teams must be between 2 and ${MAX_TEAMS_LIMIT}.`;
    return;
  }

  emit("created", {
    name: name.value.trim(),
    game: game.value.trim(),
    date: date.value,
    registrationDeadline: registrationDeadline.value,
    maxTeams: Number(maxTeams.value),
  });
  name.value = game.value = date.value = registrationDeadline.value = "";
  maxTeams.value = 8;
  error.value = "";
}
</script>

<template>
  <section class="panel">
    <h2>Create a tournament</h2>
    <form @submit.prevent="submit" novalidate>
      <label for="name">Name</label>
      <input id="name" v-model="name" type="text" />

      <label for="game">Game</label>
      <input id="game" v-model="game" type="text" />

      <label for="date">Date</label>
      <input id="date" v-model="date" type="date" />

      <label for="deadline">Registration deadline</label>
      <input
        id="deadline"
        v-model="registrationDeadline"
        type="date"
        :max="date || undefined"
      />

      <label for="max">Max number of teams</label>
      <input id="max" v-model="maxTeams" type="number" min="2" />

      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" class="button">Create</button>
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
</style>
