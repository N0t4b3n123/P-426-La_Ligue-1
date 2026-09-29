<script setup>
import { ref, computed } from "vue";
import Login from "./components/Login.vue";
import AdminCreateTournament from "./components/AdminCreateTournament.vue";
import { testTournaments, STATUSES } from "./data/tournaments.js";

const ROLES = {
  organizer: "Organizer",
  captain: "Captain",
  spectator: "Spectator",
};

const user = ref(null);
const tournaments = ref([...testTournaments]);

const isLoggedIn = computed(() => user.value !== null);
const role = computed(() => user.value?.role);

function logout() {
  user.value = null;
}

function addTournament(data) {
  tournaments.value.push({
    id: Date.now(),
    status: "registration_open",
    organizer: user.value.name,
    ...data,
  });
}
</script>

<template>
  <header>
    <div class="header">
      <div>
        <h1>La Ligue</h1>
        <p class="subtitle">Esports tournament platform</p>
      </div>
      <div v-if="isLoggedIn" class="account">
        <span>{{ user.name }} · {{ ROLES[role] }}</span>
        <button class="button button-ghost" @click="logout">Log out</button>
      </div>
    </div>
  </header>

  <main>
    <template v-if="isLoggedIn">
      <AdminCreateTournament
        v-if="role === 'organizer'"
        @created="addTournament"
      />

      <h2>Tournaments</h2>
      <p v-if="tournaments.length === 0" class="empty">No tournaments yet.</p>
      <ul v-else class="list">
        <li v-for="t in tournaments" :key="t.id">
          <strong>{{ t.name }}</strong> — {{ t.game }} · {{ t.date }} · max
          {{ t.maxTeams }} teams · {{ STATUSES[t.status] }}
        </li>
      </ul>
    </template>
    <Login v-else @logged-in="(account) => (user = account)" />
  </main>
</template>

<style scoped>
.list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}
.list li {
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  border-radius: 8px;
  background: var(--surface);
}
</style>
