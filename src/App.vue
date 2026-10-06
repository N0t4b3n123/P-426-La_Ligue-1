<script setup>
import { ref, computed } from "vue";
import Login from "./components/Login.vue";
import AdminCreateTournament from "./components/AdminCreateTournament.vue";
import CaptainRegisterTeam from "./components/CaptainRegisterTeam.vue";
import { testTournaments, STATUSES } from "./data/tournaments.js";
import {
  testRegistrations,
  REGISTRATION_STATUSES,
  activeRegistrations,
  isDeadlinePassed,
} from "./data/registrations.js";

const ROLES = {
  organizer: "Organizer",
  captain: "Captain",
  spectator: "Spectator",
};

const user = ref(null);
const tournaments = ref([...testTournaments]);
const registrations = ref([...testRegistrations]);
const selectedTournamentId = ref(null);

const isLoggedIn = computed(() => user.value !== null);
const role = computed(() => user.value?.role);

const selectedTournament = computed(() =>
  tournaments.value.find((t) => t.id === selectedTournamentId.value),
);

const myRegistrations = computed(() =>
  registrations.value.filter((r) => r.captainId === user.value?.id),
);

function logout() {
  user.value = null;
  selectedTournamentId.value = null;
}

/** "Registration open" turns into "Registration closed" after the deadline. */
function statusLabel(t) {
  if (t.status === "registration_open" && isDeadlinePassed(t)) {
    return "Registration closed";
  }
  return STATUSES[t.status];
}

function teamCount(t) {
  return activeRegistrations(registrations.value, t.id).length;
}

function tournamentName(id) {
  return tournaments.value.find((t) => t.id === id)?.name ?? "?";
}

function addTournament(data) {
  tournaments.value.push({
    id: Date.now(),
    status: "registration_open",
    organizer: user.value.name,
    ...data,
  });
}

function addRegistration(registration) {
  registrations.value.push(registration);
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

      <CaptainRegisterTeam
        v-if="role === 'captain' && selectedTournament"
        :key="selectedTournament.id"
        :tournament="selectedTournament"
        :registrations="registrations"
        :account="user"
        @registered="addRegistration"
      />

      <h2>Tournaments</h2>
      <p v-if="tournaments.length === 0" class="empty">No tournaments yet.</p>
      <ul v-else class="list">
        <li v-for="t in tournaments" :key="t.id">
          <span>
            <strong>{{ t.name }}</strong> — {{ t.game }} · {{ t.date }} ·
            {{ teamCount(t) }}/{{ t.maxTeams }} teams · {{ statusLabel(t) }}
            <template v-if="t.registrationDeadline">
              · deadline {{ t.registrationDeadline }}
            </template>
          </span>
          <button
            v-if="role === 'captain' && !isDeadlinePassed(t)"
            class="button button-ghost"
            @click="selectedTournamentId = t.id"
          >
            Register a team
          </button>
        </li>
      </ul>

      <template v-if="role === 'captain' && myRegistrations.length">
        <h2>My registrations</h2>
        <ul class="list">
          <li v-for="r in myRegistrations" :key="r.id">
            <span>
              <strong>{{ r.teamName }}</strong> —
              {{ tournamentName(r.tournamentId) }} ·
              {{ r.players.length }} players ·
              {{ REGISTRATION_STATUSES[r.status] }}
            </span>
          </li>
        </ul>
      </template>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  border-radius: 8px;
  background: var(--surface);
}
</style>
