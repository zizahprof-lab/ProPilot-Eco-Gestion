# Pilote ProPilot — 10 formateurs académiques

## Objectif
Valider en situation réelle le parcours professeur avant ouverture plus large. Le pilote porte d’abord sur l’interface professeur et sur la robustesse multi-utilisateur.

## Périmètre fonctionnel à tester
- inscription avec une adresse `@ac-aix-marseille.fr` ;
- attente puis approbation par l’administrateur ;
- création d’un établissement et ajout facultatif du logo ;
- création d’une ou plusieurs classes ;
- choix du diplôme disponible dans le pilote ;
- périodes P1 à P7 et dates PFMP intégrées à la progression ;
- progression pédagogique, contextes et pièces jointes ;
- import d’élèves par CSV ;
- évaluation rapide / tablette ;
- synthèse des compétences et positionnement ;
- PFMP ;
- CCF, pièces attendues, note proposée puis note validée ;
- documents ;
- collaboration seul / binôme / trinôme ;
- Bugs / RETEX.

## Organisation des 10 testeurs
Pour éviter dix tests identiques, répartir les usages :
1. professeur seul, une classe ;
2. professeur seul, plusieurs classes ;
3. propriétaire d’un binôme ;
4. éditeur d’un binôme ;
5. propriétaire d’un trinôme ;
6. co-propriétaire d’un trinôme ;
7. lecture seule ;
8. import CSV + évaluation rapide ;
9. PFMP + progression ;
10. CCF + documents + RETEX.

Les collègues peuvent évidemment tester au-delà de leur scénario principal.

## Parcours conseillé
1. Créer son compte.
2. Attendre l’approbation administrateur.
3. Compléter le premier assistant de configuration.
4. Créer au moins une classe.
5. Ajouter ou importer quelques élèves fictifs au premier essai.
6. Créer un contexte dans la progression.
7. Évaluer quelques élèves.
8. Vérifier la synthèse.
9. Tester une PFMP.
10. Tester le CCF et un dépôt de document.
11. Envoyer au moins un retour via **Bugs / RETEX**.

## Ce que nous voulons mesurer
- compréhension immédiate de l’interface ;
- facilité de création de la première classe ;
- cohérence avec les pratiques d’un PLP ;
- pertinence du référentiel et des compétences proposées ;
- rapidité d’évaluation ;
- lisibilité de la progression ;
- utilité de PFMP / CCF / synthèse ;
- bugs, lenteurs ou blocages ;
- fonctions manquantes ;
- fonctions perçues comme inutiles ou trop complexes.

## Consigne données
Pour le premier essai, utiliser de préférence des élèves fictifs. Ne pas saisir de données sensibles inutiles pendant la phase de validation.

## Critère de GO
Le pilote est considéré satisfaisant lorsque :
- les 10 professeurs peuvent créer et utiliser leur compte ;
- aucun blocage critique d’authentification ou de droits n’est observé ;
- les parcours progression, évaluation, PFMP, CCF et documents sont utilisables ;
- les RETEX critiques sont traités ;
- aucune régression de la version professeur de référence n’est constatée.
