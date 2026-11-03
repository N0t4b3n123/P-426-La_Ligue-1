<script setup>
import { reactive, ref } from "vue";
import { updateRegistrationDeadline } from "../data/tournaments.js";

const props = defineProps({
  tournaments: { type: Array, required: true },
  account: { type: Object, required: true },
});

const emit = defineEmits(["deadline-updated"]);

const drafts = reactive({});
const messages = ref({});

function draftFor(t) {
  return drafts[t.id] ?? t.registrationDeadline ?? "";
}

function save(t) {
  const result = updateRegistrationDeadline(t, props.account, draftFor(t));

  if (!result.ok) {
    messages.value[t.id] = { type: "error", text: result.error };
    return;
  }

  emit("deadline-updated", {
    tournamentId: t.id,
    registrationDeadline: result.registrationDeadline,
  });
  delete drafts[t.id];
  messages.value[t.id] = { type: "success", text: "Deadline updated." };
}
</script>

<template>
  <section class="panel">
    <h2>Registration deadlines</h2>
    <p v-if="tournaments.length === 0" class="empty">No tournaments yet.</p>

    <ul v-else class="deadline-list">
      <li v-for="t in tournaments" :key="t.id" class="deadline-card">
        <div class="deadline-row">
          <div>
            <strong>{{ t.name }}</strong>
            <p>Tournament date: {{ t.date }}</p>
          </div>

          <div class="controls">
            <input
              type="date"
              :value="draftFor(t)"
              :max="t.date"
              :disabled="t.status !== 'registration_open'"
              @input="drafts[t.id] = $event.target.value"
            />
            <button
              class="button"
              type="button"
              :disabled="t.status !== 'registration_open'"
              @click="save(t)"
            >
              Save
            </button>
          </div>
        </div>

        <p v-if="t.status !== 'registration_open'" class="hint">
          Registrations are closed: the deadline is locked.
        </p>
        <p
          v-if="messages[t.id]"
          :class="messages[t.id].type === 'error' ? 'error' : 'success'"
        >
          {{ messages[t.id].text }}
        </p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.deadline-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}
.deadline-card {
  padding: 1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}
.deadline-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.deadline-row p,
.hint {
  margin: 0.25rem 0 0;
  color: var(--text-soft);
}
.controls {
  display: flex;
  gap: 0.5rem;
}
.controls input {
  font: inherit;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-strong);
  background: var(--field);
  color: var(--text);
}
.button:disabled,
.controls input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.success {
  color: var(--success);
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
}
@media (max-width: 640px) {
  .deadline-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
