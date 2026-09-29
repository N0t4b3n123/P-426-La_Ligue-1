<script setup>
import { ref } from "vue";

const emit = defineEmits(["created"]);

const name = ref("");
const game = ref("");
const date = ref("");
const maxTeams = ref(8);
const error = ref("");

function submit() {
  if (!name.value.trim() || !game.value.trim() || !date.value) {
    error.value = "Name, game and date are required.";
    return;
  }
  if (maxTeams.value < 2) {
    error.value = "At least 2 teams are required.";
    return;
  }
  emit("created", {
    name: name.value.trim(),
    game: game.value.trim(),
    date: date.value,
    maxTeams: Number(maxTeams.value),
  });
  name.value = game.value = date.value = "";
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
form .button {
  margin-top: 1rem;
}
</style>
