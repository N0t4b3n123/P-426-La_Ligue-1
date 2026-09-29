<script setup>
import { ref } from "vue";
import { authenticate } from "../data/accounts.js";

const emit = defineEmits(["logged-in"]);

const username = ref("");
const password = ref("");
const error = ref("");

function submit() {
  const account = authenticate(username.value, password.value);
  if (!account) {
    error.value = "Incorrect username or password.";
    password.value = ""; // dont keep a rejected password
    return;
  }
  emit("logged-in", account);
}
</script>

<template>
  <section class="login" aria-labelledby="login-title">
    <h2 id="login-title">Log in</h2>
    <form @submit.prevent="submit" novalidate>
      <label for="username">Username</label>
      <input
        id="username"
        v-model="username"
        type="text"
        autocomplete="username"
        autofocus
      />

      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        autocomplete="current-password"
      />

      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <button type="submit" class="button">Log in</button>
    </form>

    <details class="test-accounts">
      <summary>Test accounts</summary>
      <ul>
        <li><code>organizer</code> / <code>org123</code></li>
        <li><code>captain</code> / <code>cap123</code></li>
        <li><code>spectator</code> / <code>spec123</code></li>
      </ul>
    </details>
  </section>
</template>

<style scoped>
.login {
  max-width: 420px;
}
form {
  display: grid;
  gap: 0.4rem;
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
.test-accounts {
  margin-top: 1.5rem;
  color: var(--text-soft);
  font-size: 0.9rem;
}
code {
  background: var(--surface);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}
</style>
