---
name: marco-ui-security
description: Examiner la sécurité navigateur et le périmètre frontend des changements React de Marco/Miam. Utiliser pour les revues UI et avant livraison, sans corriger le backend.
---

# Revue de sécurité UI Marco

Lire le `AGENTS.md` et `UI_SECURITY.md` à la racine du projet, trois niveaux
au-dessus du dossier du skill. Une revue examine les preuves sans modifier de
fichiers ni installer de dépendances.

## Sécurité navigateur

Suivre chaque entrée modifiée (formulaire, URL, fixture, API ou texte généré)
jusqu'à son affichage, sa navigation, sa requête ou son stockage. Appliquer les
règles de `UI_SECURITY.md`. Examiner aussi ressources, dépendances et scripts.
Exiger une preuve de validation à l'exécution pour des réponses externes ; un
type TypeScript ne valide pas des données reçues.

Sur les chemins concernés, proposer ou examiner un cas hostile concret : balise
avec gestionnaire d'événement affichée comme texte, URL `javascript:`, contenu
très long, erreur API ou réponse malformée. Ne pas prétendre avoir exécuté un
test qui a seulement été proposé. N'utiliser que des fixtures et services locaux
autorisés pour reproduire ; aucun trafic vers un service réel par défaut.

## Périmètre et confidentialité

Comparer l'état initial au diff final, y compris fichiers indexés et non suivis.
Identifier les commandes produisant des écritures ou communications hors UI.
Signaler toute logique serveur ou décision métier ajoutée au navigateur, secret
exposé, télémétrie, persistance ou appel externe non autorisé. Vérifier les
chemins réels des sorties et l'absence de liens symboliques sortants.

## Compte rendu

Pour chaque constat : gravité, fichier et ligne, scénario concret, effet,
correction minimale dans le périmètre et contrôle permettant de la vérifier.
Distinguer défaut démontré, risque dépendant du contexte et contrôle impossible.
Sans preuve, poser une question ciblée plutôt qu'affirmer une vulnérabilité.

S'il n'existe encore aucune UI, examiner uniquement le cadrage et l'indiquer.
Ne jamais annoncer une certification, une absence générale de vulnérabilité ou
une isolation effective à partir de cette revue.
