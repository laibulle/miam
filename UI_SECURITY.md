# Cadre de sécurité de l'UI

## Statut initial — 4 septembre 2026

Le dépôt possède une application Python et des templates HTML. Le frontend
React reste à créer dans `ui/` après définition du premier écran. Les seuls
ajouts de ce cadrage sont les instructions, skills, profils de revue et règles.

La session ayant préparé ces fichiers dispose d'un accès disque sans restriction,
du réseau et d'une politique d'approbation `never`. Ces fichiers ne changent pas
les permissions de cette session. L'isolation technique UI seule n'est pas
établie. Les profils demandent un sandbox en lecture seule pour de futurs
chargements compatibles ; leur seule présence ne prouve pas son application.

## Règles de l'application

| Surface | Règle du projet |
| --- | --- |
| Contenu | Afficher les saisies, réponses API et textes de modèle comme texte React. Interdire `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval` et `new Function`. |
| Markdown | Aucun rendu HTML ou Markdown riche tant que ce besoin et son traitement de sécurité ne sont pas définis. |
| Liens | Utiliser des routes internes connues. Pour un lien externe demandé, analyser l'URL et autoriser explicitement protocole HTTPS et destinations attendues ; rejeter les autres protocoles, URL avec identifiants et destinations non prévues. Ajouter `rel="noopener noreferrer"` aux nouveaux onglets. |
| Secrets | Aucun secret ou jeton dans le code, les fixtures, les variables exposées au bundle, les URL, les journaux ou les captures. Ne pas ouvrir `.env`. |
| Réseau | Fixtures en mémoire par défaut. Pas de télémétrie, CDN, police distante, image distante, iframe, SDK tiers, service worker ou appel externe sans besoin explicitement autorisé. Le serveur de développement reste sur l'interface loopback. |
| Données | Ne pas stocker de données personnelles ou jetons dans localStorage, sessionStorage ou IndexedDB. Pas de persistance pour le prototype. Fixtures inventées. |
| API | Intégration seulement sur demande explicite et contrat public disponible. Vérifier les réponses à l'exécution ; gérer erreurs et annulation. Ne pas afficher les détails techniques sensibles des erreurs. |
| Authentification | Aucun secret navigateur, faux mécanisme d'autorisation ou contournement CORS/CSRF. Signaler les besoins de session/CSRF au responsable backend. |
| Métier | Ne pas recalculer recommandations, calories, allergies ou autorisations dans l'UI. Présenter fidèlement les données fournies, sans en faire une garantie médicale. |
| Dépendances | Dépendances minimales dans `ui/`, lockfile local et scripts examinés. Aucun correctif automatique avec élargissement de périmètre. Une analyse de dépendances distante peut transmettre leur liste : ne pas l'exécuter implicitement. |

## Protections Codex : ce que chaque mécanisme fait

- `AGENTS.md` porte les instructions de projet ; ce n'est pas une ACL.
- `.agents/skills/` contient les procédures réutilisables propres à ce dépôt.
- `.codex/agents/` définit deux profils spécialisés pour les hôtes compatibles.
  Ils peuvent être remplacés par une délégation explicite des mêmes missions.
- `.codex/rules/ui-safety.rules` refuse quelques préfixes de commandes hors
  sandbox. Ce fichier doit être chargé par une couche projet approuvée au
  démarrage. Les variantes de commande, outils de fichiers, connecteurs et
  interpréteurs ne sont pas tous couverts. Ne pas utiliser ces limites pour
  contourner le périmètre.
- L'isolation réelle dépend des permissions imposées par l'hôte : préférer un
  environnement qui ne monte que le frontend en écriture, sans secrets, avec
  réseau restreint. Un sandbox autorisant l'écriture de tout ce dépôt protège
  insuffisamment le backend ; un worktree seul n'est pas une barrière d'accès.

Avant une session censée garantir techniquement « UI seule », vérifier les
permissions effectives, les montages/chemins autorisés, les outils connectés et
le réseau. Les essais de refus doivent utiliser des fichiers canaris jetables
dans l'environnement isolé, jamais les fichiers backend ou secrets réels.
Le changement des permissions de l'hôte reste une étape de configuration à
effectuer et vérifier ; aucun fichier ajouté ici ne l'a réalisée.

## Contrat de livraison

La livraison liste le périmètre modifié, les validations réellement exécutées,
les deux avis indépendants et leurs limites. Une absence de constat ne vaut
pas preuve d'absence de faille. Les protections serveur (autorisations, cookies,
CSP et en-têtes HTTP) sont des dépendances d'intégration à documenter lorsqu'elles
deviennent pertinentes ; elles ne justifient pas de modifier le serveur.

## Références officielles Codex

- [Instructions AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Skills de dépôt](https://learn.chatgpt.com/docs/build-skills)
- [Profils de sous-agents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Règles de commandes](https://learn.chatgpt.com/docs/agent-configuration/rules)
- [Sandbox](https://learn.chatgpt.com/docs/sandboxing)
