<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import Login from "./components/Login.vue";
import AdminCreateTournament from "./components/AdminCreateTournament.vue";
import CaptainRegisterTeam from "./components/CaptainRegisterTeam.vue";
import OrganizerRegistrations from "./components/OrganizerRegistrations.vue";
import OrganizerBracket from "./components/OrganizerBracket.vue";
import OrganizerDeadlines from "./components/OrganizerDeadlines.vue";
import SpectatorBracket from "./components/SpectatorBracket.vue";
import { testTournaments, STATUSES } from "./data/tournaments.js";
import { loadList, saveList, onExternalChange } from "./data/storage.js";
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
// Saved in localStorage: the bracket survives a refresh (US spectator, BDD 4).
const tournaments = ref(loadList("tournaments", [...testTournaments]));
const registrations = ref(loadList("registrations", [...testRegistrations]));
const showLogin = ref(false);
const selectedTournamentId = ref(null);

const isLoggedIn = computed(() => user.value !== null);
const role = computed(() => user.value?.role);

const selectedTournament = computed(() =>
  tournaments.value.find((t) => t.id === selectedTournamentId.value),
);

const myRegistrations = computed(() =>
  registrations.value.filter((r) => r.captainId === user.value?.id),
);

watch(tournaments, (list) => saveList("tournaments", list), { deep: true });
watch(registrations, (list) => saveList("registrations", list), { deep: true });

// Another tab (e.g. the organizer) saved a score: reload it here (US spectator, BDD 3).
let stopListening;
onMounted(() => {
  stopListening = onExternalChange((name) => {
    const target = name === "tournaments" ? tournaments : registrations;
    target.value = loadList(name, target.value);
  });
});
onBeforeUnmount(() => stopListening?.());

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

function reviewRegistration({ id, status, refusalComment }) {
  const registration = registrations.value.find((r) => r.id === id);

  if (!registration) return;

  registration.status = status;
  registration.refusalComment = refusalComment;
}

function setDeadline({ tournamentId, registrationDeadline }) {
  const tournament = tournaments.value.find((t) => t.id === tournamentId);
  if (!tournament) return;

  tournament.registrationDeadline = registrationDeadline;
}

/** Stores the bracket and closes registrations automatically. */
function setBracket({ tournamentId, bracket }) {
  const tournament = tournaments.value.find((t) => t.id === tournamentId);
  if (!tournament) return;

  tournament.bracket = bracket;
  tournament.status = "in_progress"; // registrationState() => 'closed'
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
      <div v-else class="account">
        <button class="button button-ghost" @click="showLogin = !showLogin">
          {{ showLogin ? "Back to bracket" : "Log in" }}
        </button>
      </div>
    </div>
  </header>

  <main>
    <template v-if="isLoggedIn">
      <AdminCreateTournament
        v-if="role === 'organizer'"
        @created="addTournament"
      />
      <OrganizerDeadlines
        v-if="role === 'organizer'"
        :tournaments="tournaments"
        :account="user"
        @deadline-updated="setDeadline"
      />
      <OrganizerRegistrations
        v-if="role === 'organizer'"
        :registrations="registrations"
        :tournaments="tournaments"
        @reviewed="reviewRegistration"
      />
      <OrganizerBracket
        v-if="role === 'organizer'"
        :tournaments="tournaments"
        :registrations="registrations"
        :account="user"
        @generated="setBracket"
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
            v-if="
              role === 'captain' &&
              t.status === 'registration_open' &&
              !isDeadlinePassed(t)
            "
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

      <SpectatorBracket v-if="role !== 'organizer'" :tournaments="tournaments" />
    </template>

    <!-- Not logged in: the public bracket is visible, login is optional. -->
    <Login
      v-else-if="showLogin"
      @logged-in="
        (account) => {
          user = account;
          showLogin = false;
        }
      "
    />
    <SpectatorBracket v-else :tournaments="tournaments" />
  </main>
</template>

<style scoped>
.list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  display: grid;
  gap: 0.75rem;
}
.list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  transition:
    box-shadow 0.15s,
    border-color 0.15s;
}
.list li:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-strong);
}
.list li > span {
  color: var(--text-soft);
}
.list strong {
  color: var(--text);
  font-weight: 600;
}
.list .button {
  flex-shrink: 0;
  white-space: nowrap;
}
@media (max-width: 640px) {
  .list li {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
