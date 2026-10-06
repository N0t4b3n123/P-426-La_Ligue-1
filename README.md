<<<<<<< HEAD
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
=======
# Description du projet — La Ligue (module I426)

**La Ligue** est une plateforme web de gestion et de suivi de tournois esport, développée pour permettre à des organisateurs de créer et piloter des compétitions par élimination directe, tout en offrant aux spectateurs une expérience communautaire interactive autour de ces tournois.

## Contexte et objectif

Le client souhaite digitaliser l'organisation de ses tournois de jeux vidéo (gestion des inscriptions, génération automatique des brackets, suivi des résultats) tout en animant sa communauté grâce à un système de pronostics gratuit, sans enjeu financier réel — uniquement un classement basé sur des points.

## Utilisateurs cibles (rôles)

- **Organisateur** : crée les tournois, valide les inscriptions, saisit les résultats, gère les imprévus (forfaits, litiges) et consulte les statistiques.
- **Capitaine d'équipe** : inscrit son équipe à un tournoi.
- **Spectateur** : suit les tournois, consulte les classements, et peut pronostiquer les vainqueurs des matchs pour gagner des points.
- Tout utilisateur doit se connecter pour que ses actions (inscription, pronostic, etc.) soient rattachées à son compte.

## Fonctionnalités principales

1. **Gestion des tournois** — création, définition des paramètres (jeu, date, nombre max d'équipes).
2. **Gestion des inscriptions** — inscription des équipes par les capitaines, validation/refus par l'organisateur.
3. **Bracket et compétition** — génération automatique du bracket par tirage au sort, saisie des scores, progression automatique des vainqueurs, gestion des cas particuliers (forfait, ex-aequo, match non joué).
4. **Suivi et classement** — consultation du bracket en temps réel, classement des équipes, statistiques par joueur.
5. **Pronostics communautaires** — les spectateurs pronostiquent l'issue des matchs avant leur début et grimpent dans un classement public basé sur des points (aucun argent réel en jeu).
6. **Authentification** — connexion par identifiant/mot de passe, avec des droits différenciés selon le rôle.

## Périmètre (à partir des 12 user stories fournies)

Le backlog couvre l'intégralité du cycle de vie d'un tournoi : de sa création à sa clôture, en passant par les inscriptions, la compétition elle-même, et l'engagement communautaire via les pronostics et classements.

## Points en suspens à clarifier avec le client

- Processus de création de compte (le backlog ne couvre que la connexion).
- Règles de gestion des cas particuliers (départage d'un ex-aequo, liste d'attente si le tournoi est complet).
- Critère exact du classement des équipes (victoires cumulées vs. stade d'élimination atteint).

on a fait us 2 et 3 

>>>>>>> 5a99e03f84ff2439d850acc7523d103c750d1a2a
