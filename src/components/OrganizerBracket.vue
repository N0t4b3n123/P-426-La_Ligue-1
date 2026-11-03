<script setup>
import { ref } from "vue";
import {
  bracketBlocker,
  generateBracket,
  roundName,
  validatedRegistrations,
} from "../data/brackets.js";

const props = defineProps({
  tournaments: { type: Array, required: true },
  registrations: { type: Array, required: true },
  account: { type: Object, required: true },
});

const emit = defineEmits(["generated"]);

const errors = ref({});
const pendingConfirmId = ref(null);

function validatedCount(t) {
  return validatedRegistrations(props.registrations, t.id).length;
}

function generate(t, confirmed = false) {
  errors.value[t.id] = "";
  const result = generateBracket(t, props.registrations, props.account, {
    confirmed,
  });

  if (result.needsConfirmation) {
    pendingConfirmId.value = t.id;
    return;
  }
  if (!result.ok) {
    errors.value[t.id] = result.error;
    return;
  }

  pendingConfirmId.value = null;
  emit("generated", { tournamentId: t.id, bracket: result.bracket });
}
</script>

<template>
  <section class="panel">
    <h2>Brackets</h2>
    <p v-if="tournaments.length === 0" class="empty">No tournaments yet.</p>

    <ul v-else class="bracket-list">
      <li v-for="t in tournaments" :key="t.id" class="bracket-card">
        <div class="bracket-header">
          <div>
            <strong>{{ t.name }}</strong>
            <p>{{ validatedCount(t) }} validated team(s)</p>
          </div>

          <button
            class="button"
            type="button"
            :disabled="
              !t.bracket && bracketBlocker(t, registrations) !== null
            "
            @click="generate(t)"
          >
            {{ t.bracket ? "Regenerate bracket" : "Generate bracket" }}
          </button>
        </div>

        <p v-if="!t.bracket && bracketBlocker(t, registrations)" class="hint">
          {{ bracketBlocker(t, registrations) }}
        </p>
        <p v-if="errors[t.id]" class="error">{{ errors[t.id] }}</p>

        <div v-if="pendingConfirmId === t.id" class="warning" role="alert">
          <p>
            <strong>Warning:</strong> a new draw will replace the current
            bracket. This cannot be undone.
          </p>
          <div class="actions">
            <button
              class="button button-danger"
              type="button"
              @click="generate(t, true)"
            >
              Yes, regenerate
            </button>
            <button
              class="button button-ghost"
              type="button"
              @click="pendingConfirmId = null"
            >
              Cancel
            </button>
          </div>
        </div>

        <template v-if="t.bracket">
          <p class="meta">
            {{ t.bracket.teamCount }} teams · {{ t.bracket.byeCount }} bye(s) ·
            registrations closed
          </p>
          <div class="rounds">
            <div
              v-for="(round, i) in t.bracket.rounds"
              :key="i"
              class="round"
            >
              <h3>{{ roundName(i + 1, t.bracket.rounds.length) }}</h3>
              <div v-for="m in round" :key="m.id" class="match">
                <div class="slot">{{ m.team1?.name ?? "TBD" }}</div>
                <div class="slot" :class="{ bye: m.bye }">
                  {{ m.bye ? "BYE" : (m.team2?.name ?? "TBD") }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.bracket-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}
.bracket-card {
  padding: 1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}
.bracket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.bracket-header p,
.meta,
.hint {
  margin: 0.25rem 0 0;
  color: var(--text-soft);
}
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.button-danger {
  background: var(--error);
}
.warning {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--error);
  border-radius: 8px;
}
.warning p {
  margin: 0;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.rounds {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
.round {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 0.75rem;
  min-width: 170px;
}
.round h3 {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-soft);
}
.match {
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  overflow: hidden;
}
.slot {
  padding: 0.4rem 0.6rem;
  background: var(--field);
}
.slot + .slot {
  border-top: 1px solid var(--border);
}
.slot.bye {
  color: var(--text-muted);
  font-style: italic;
}
@media (max-width: 640px) {
  .bracket-header {
    flex-direction: column;
  }
}
</style>
