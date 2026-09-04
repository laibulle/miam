---
name: marco-react-ui
description: Construire ou modifier uniquement l'interface React du projet Marco/Miam, avec fixtures locales et validation UI. Appliquer pour les écrans et interactions de ce projet.
---

# Développement UI Marco

Lire le `AGENTS.md` à la racine du projet et `UI_SECURITY.md` avant de modifier
l'interface. Ces chemins se trouvent trois niveaux au-dessus du dossier du skill.

1. Identifier le parcours, ses données affichées et les interactions demandées.
   Si aucun écran n'est défini, terminer le cadrage puis demander le premier
   parcours. Ne pas inventer de besoins métier à partir du nom du dépôt.
2. Travailler uniquement dans `ui/` pour le code : React et TypeScript côté
   navigateur, styles et ressources locales. Choisir la structure minimale
   utile et conserver les conventions déjà présentes. Ne pas créer de serveur
   applicatif ni modifier les templates Python.
3. Utiliser des fixtures fictives explicites et un état en mémoire pour le
   prototype. Une action simulée doit être présentée comme telle ; ne pas
   afficher une réussite de sauvegarde ou de génération réelle sans résultat.
4. Prévoir chargement, erreur, absence de résultat et contenu long pour les
   parcours qui les nécessitent. Utiliser des éléments HTML sémantiques, labels,
   focus visible, navigation clavier, réduction des animations et mise en page
   mobile. Respecter les choix visuels de l'utilisateur.
5. Garder les dépendances limitées à l'UI, versions résolues dans un lockfile
   local à `ui/`. Examiner les scripts d'installation et de construction et
   leurs effets avant exécution. Ne pas lancer de scaffolder distant non relu,
   installation globale, correction automatique globale ou installation Python.
6. Pour une intégration explicitement demandée, utiliser un contrat public
   fourni ou consultable sans secret. Centraliser les appels navigateur, gérer
   annulation et erreurs, vérifier les données reçues à l'exécution. Ne pas
   contourner une erreur CORS ou une authentification absente par un proxy.
7. Vérifier compilation et parcours modifiés puis demander les deux revues
   définies dans `AGENTS.md`. Fournir le diff, les contrôles et leurs limites.

Une demande d'UI n'autorise pas le déploiement. Si un outil ou un autre skill
propose automatiquement de publier, conserver le résultat local.
