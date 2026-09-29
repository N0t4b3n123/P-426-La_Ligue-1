# La Ligue — socle de départ

Ce dossier est votre point de départ pour le projet **La Ligue** (module I426 / projet P_DEV-426).
C'est un projet **Vue 3 + Vite** minimal : il démarre, il s'affiche, et il est vide. Tout ce que
vous y ajoutez est **votre** version du produit — trois équipes, trois versions du même backlog.

## Démarrer

Il faut Node.js installé (v20 ou plus récent).

```
npm install
npm run dev
```

Puis ouvrez l'adresse affichée (par défaut http://localhost:5173).
Pour produire une version compilée : `npm run build`.

## Où écrire

- `src/App.vue` — la coquille de l'application (en-tête, objectif de sprint, zone des écrans).
- `src/components/` — un fichier par écran (`AdminCreerTournoi.vue`, `Connexion.vue`, …).
- `src/data/` — vos données de test (à remplacer par les appels au serveur quand il existera).
- `src/style.css` — la base de style, à adapter.

## Ce que dit le client

- Une user story ne part pas en développement si elle n'est pas dans le **Sprint Backlog** du board.
- Un écran n'est **terminé** que s'il passe la **Definition of Done** : le code est committé et poussé,
  l'écran fonctionne sans erreur, il est testé selon son cas de test, il est présentable en revue.
- La maquette montrée par le client en séance donne la **cible** ; ce n'est pas un code à recopier.
  Votre travail est de la reconstruire avec vos choix techniques.
- Les pronostics de La Ligue sont un **jeu à points** (classement public) : **aucun argent réel**.

## Règle de dépôt

Chaque tâche est committée **individuellement** et poussée sur votre dépôt — c'est ce qui rend le
travail de chacun visible en revue et dans la note de processus.
