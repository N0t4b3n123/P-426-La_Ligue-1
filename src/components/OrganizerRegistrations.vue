<script setup>
import { computed, ref } from "vue";
import { REGISTRATION_STATUSES } from "../data/registrations.js";

const props = defineProps({
  registrations: { type: Array, required: true },
  tournaments: { type: Array, required: true },
});

const emit = defineEmits(["reviewed"]);

const refusalComments = ref({});

const acceptedRegistrations = computed(() =>
  props.registrations.filter((r) => r.status === "accepted"),
);

function tournamentName(id) {
  return props.tournaments.find((t) => t.id === id)?.name ?? "?";
}

function accept(registration) {
  emit("reviewed", {
    id: registration.id,
    status: "accepted",
    refusalComment: "",
  });
}

function reject(registration) {
  emit("reviewed", {
    id: registration.id,
    status: "rejected",
    refusalComment: refusalComments.value[registration.id]?.trim() ?? "",
  });

  refusalComments.value[registration.id] = "";
}
</script>

<template>
  <section class="panel">
    <h2>Registrations</h2>

    <p v-if="registrations.length === 0" class="empty">
      No registrations yet.
    </p>

    <ul v-else class="registration-list">
      <li
        v-for="r in registrations"
        :key="r.id"
        class="registration-card"
      >
        <div class="registration-header">
          <div>
            <strong>{{ r.teamName }}</strong>

            <p>
              {{ tournamentName(r.tournamentId) }}
              · {{ r.players.length }} players
            </p>
          </div>

          <span
            class="status"
            :class="`status-${r.status}`"
          >
            {{ REGISTRATION_STATUSES[r.status] }}
          </span>
        </div>

        <div
          v-if="r.status === 'pending_validation'"
          class="actions"
        >
          <button
            class="button"
            type="button"
            @click="accept(r)"
          >
            Validate
          </button>

          <input
            v-model="refusalComments[r.id]"
            type="text"
            placeholder="Refusal comment (optional)"
          />

          <button
            class="button button-danger"
            type="button"
            @click="reject(r)"
          >
            Refuse
          </button>
        </div>

        <p
          v-if="r.status === 'rejected' && r.refusalComment"
          class="comment"
        >
          Refusal comment: {{ r.refusalComment }}
        </p>
      </li>
    </ul>
  </section>

  <section class="panel">
    <h2>Participants</h2>

    <p
      v-if="acceptedRegistrations.length === 0"
      class="empty"
    >
      No validated teams yet.
    </p>

    <ul v-else class="participant-list">
      <li
        v-for="r in acceptedRegistrations"
        :key="r.id"
      >
        <strong>{{ r.teamName }}</strong>
        — {{ tournamentName(r.tournamentId) }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.registration-list,
.participant-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.registration-card,
.participant-list li {
  padding: 1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}

.registration-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.registration-header p {
  margin: 0.25rem 0 0;
  color: var(--text-soft);
}

.status {
  flex-shrink: 0;
  padding: 0.3rem 0.55rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-pending_validation {
  background: var(--bg-soft);
  color: var(--text-soft);
}

.status-accepted {
  background: var(--success-bg);
  color: var(--success);
}

.status-rejected {
  background: var(--error-bg, #3d1f24);
  color: var(--error);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.actions input {
  flex: 1;
  min-width: 220px;
  font: inherit;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-strong);
  background: var(--field);
  color: var(--text);
}

.button-danger {
  background: var(--error);
}

.comment {
  margin: 0.75rem 0 0;
  color: var(--text-soft);
}

@media (max-width: 640px) {
  .registration-header,
  .actions {
    flex-direction: column;
  }

  .actions input {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }
}
</style>