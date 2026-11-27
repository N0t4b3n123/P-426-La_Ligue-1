<script setup>
import { computed, ref } from "vue";
import { calculatePredictionRanking } from "../data/predictionRanking.js";

// Public view: no login required, no action. Recomputed automatically from the
// bracket and the predictions, so a validated score updates it right away.
const props = defineProps({
  tournaments: { type: Array, required: true },
  predictions: { type: Array, default: () => [] },
  account: { type: Object, default: null },
});

const selectedId = ref(null); // null = all tournaments

const ranking = computed(() =>
  calculatePredictionRanking(props.predictions, props.tournaments, {
    tournamentId: selectedId.value,
  }),
);

const hasFinishedPredictions = computed(() =>
  ranking.value.some((row) => row.total > 0),
);
</script>

<template>
  <section class="panel" aria-labelledby="prediction-ranking-title">
    <h2 id="prediction-ranking-title">Classement des pronostics</h2>

    <p class="meta">
      1 point par pronostic correct sur un match terminé. À points égaux,
      le meilleur taux de réussite (corrects / total) passe devant ; les
      participants encore à égalité partagent le même rang. Jeu à points :
      aucun argent réel.
    </p>

    <label v-if="tournaments.length > 1" class="picker">
      Tournoi
      <select
        :value="selectedId ?? ''"
        @change="selectedId = $event.target.value === '' ? null : Number($event.target.value)"
      >
        <option value="">Tous les tournois</option>
        <option v-for="t in tournaments" :key="t.id" :value="t.id">
          {{ t.name }}
        </option>
      </select>
    </label>

    <p v-if="ranking.length === 0" class="empty">
      Aucun pronostic pour le moment.
    </p>

    <template v-else>
      <p v-if="!hasFinishedPredictions" class="empty">
        Aucun match pronostiqué n'est terminé : les points arriveront après les
        premiers résultats.
      </p>

      <div class="table-scroll" role="region" aria-label="Classement des pronostics" tabindex="0">
        <table aria-live="polite">
          <thead>
            <tr>
              <th scope="col">Rang</th>
              <th scope="col">Participant</th>
              <th scope="col">Points</th>
              <th scope="col">Corrects / Total</th>
              <th scope="col">En attente</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in ranking"
              :key="row.userId"
              :class="{ me: account && row.userId === account.id }"
            >
              <td>{{ row.rank }}</td>
              <td>
                {{ row.name }}
                <span v-if="account && row.userId === account.id" class="you">(vous)</span>
              </td>
              <td class="points">{{ row.points }}</td>
              <td>{{ row.correct }} / {{ row.total }}</td>
              <td>{{ row.pending }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<style scoped>
.meta { margin: 0 0 0.75rem; color: var(--text-soft); font-size: 0.9rem; }
.picker {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 320px;
  margin-bottom: 0.75rem;
  color: var(--text-soft);
  font-size: 0.9rem;
}
.picker select {
  font: inherit;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: var(--field);
  color: var(--text);
}
.table-scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
th { background: var(--field); font-weight: 600; }
.points { font-weight: 700; font-variant-numeric: tabular-nums; }
tr.me { background: var(--accent-soft); }
.you { color: var(--accent-text); font-size: 0.85rem; }
@media (max-width: 640px) {
  th, td { padding: 0.6rem 0.5rem; }
}
</style>
