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
  margin-top: 1rem;
  padding: 1.75rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  box-shadow: var(--shadow-md);
}
.login h2 {
  margin-top: 0;
}
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
.test-accounts {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  color: var(--text-soft);
  font-size: 0.9rem;
}
.test-accounts summary {
  cursor: pointer;
  font-weight: 500;
}
code {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  color: var(--accent-text);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}
</style>
