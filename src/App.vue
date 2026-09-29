<script setup>
// Socle de départ — La Ligue (module I426 / projet P_DEV-426).
// L'application est vide : votre travail de sprint commence dans <main>.
// Tout ce que vous ajoutez ici est VOTRE version du produit (option A : 3 équipes, 3 versions).
import { ref } from 'vue';

// Nom de l'équipe — à remplacer par le vôtre.
const equipe = ref('équipe 1');

// État du sprint — à tenir à jour, c'est ce qui se voit en revue.
const sprint = ref(1);
const sprintGoal = ref('à écrire par le Product Owner');
</script>

<template>
  <header>
    <h1>La Ligue</h1>
    <p class="sous-titre">Plateforme de tournoi esport — travail d'équipe {{ equipe }}</p>
  </header>

  <section class="etat">
    <h2>Sprint {{ sprint }}</h2>
    <p><strong>Objectif du sprint :</strong> {{ sprintGoal }}</p>
  </section>

  <main>
    <!-- À construire : vos écrans arrivent ici.
         Ordre imposé par le client : les user stories du sprint.
         Un écran = un composant dans src/components/, importé ici. -->
    <p class="vide">Aucun écran pour l'instant. Commencez par la première user story du sprint.</p>
  </main>

  <footer>
    <p>Projet scolaire — les pronostics sont un jeu à <strong>points</strong> : aucun argent réel.</p>
  </footer>
</template>
