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
