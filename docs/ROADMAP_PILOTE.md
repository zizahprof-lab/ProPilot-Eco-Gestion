# Roadmap pilote ProPilot

## Principe non négociable

La version personnelle du professeur reste la référence fonctionnelle et ergonomique.

La version multi-prof ajoute :
- authentification ;
- multi-classes ;
- multi-diplômes ;
- collaboration ;
- espace élève ;
- administration ;
- sécurité ;

sans supprimer ni simplifier les fonctions historiques.

## État actuel

### Fonctionnel
- progression P1 à P7 avec PFMP intégrées ;
- contextes riches et compétences ;
- transversalités économie-droit ;
- évaluations rapides et mode classe ;
- synthèses et positionnement final ;
- PFMP ;
- CCF ;
- dossier documentaire CCF ;
- espace élève configurable ;
- collaboration propriétaire / co-propriétaire / éditeur / lecture seule ;
- administration technique séparée des données nominatives élèves ;
- sécurité Supabase/RLS renforcée.

### À valider avant ouverture du pilote
- build Vite de production ;
- test de connexion enseignant réel ;
- approbation administrateur ;
- invitation binôme/trinôme ;
- droits des quatre rôles ;
- création et duplication de classe ;
- import élèves ;
- parcours progression → évaluation → synthèse ;
- PFMP ;
- CCF ;
- dépôt, téléchargement et suppression de documents ;
- parcours élève complet ;
- affichage mobile/tablette ;
- restauration d'une sauvegarde JSON ;
- test avec plusieurs comptes simultanés.

## Critère « prêt pour pilote »

Le pilote peut commencer uniquement si :
1. le build production passe ;
2. aucun blocage critique n'est connu ;
3. les parcours professeur et élève passent ;
4. les rôles ont été testés ;
5. les données élèves restent cloisonnées ;
6. les fonctionnalités de la version personnelle passent les contrôles de non-régression.
