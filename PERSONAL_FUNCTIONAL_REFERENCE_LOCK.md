# Verrou fonctionnel — version personnelle

La version personnelle de Mohamed reste la référence fonctionnelle et ergonomique de l'espace professeur.

## Règle de non-régression

Une évolution multi-prof ne doit jamais supprimer, simplifier ou remplacer une fonction déjà présente dans la version personnelle de référence. Les fonctions multi-prof, sécurité, administration, rôles et espace élève sont ajoutées autour de ce socle.

## Socle à conserver

- progression annuelle P1 à P7 avec PFMP insérées dans la frise ;
- navigation horizontale Début / ← / → / Fin ;
- couleurs GC1 / GC2 / GC3 / GC4A / GC4B ;
- filtres enseignant, groupe de compétences et niveau d'apprentissage ;
- contextes et événements, problématique, enseignant(s), durée, statut, cycle, réorganisation manuelle ;
- compétences officielles, comportements professionnels, savoirs, résultats attendus et préremplissage depuis le référentiel ;
- transversalités économie-droit ;
- pièces jointes privées dans la progression ;
- duplication d'un contexte et accès direct à l'évaluation depuis un contexte ;
- liste élèves, ajout manuel et import CSV ;
- évaluation rapide/tablette et niveaux de maîtrise ;
- synthèse par élève, note indicative configurable et positionnement final ;
- suivi PFMP, périodes propres à la classe, débriefs et objectifs ;
- CCF, résultats, documents et dossier par épreuve ;
- accès élève configurable ;
- réglages de classe, modules, libellés, note indicative et visibilité ;
- sauvegarde/restauration JSON, duplication et archivage de classe ;
- exports CSV ;
- identité établissement et logo ;
- multi-classe, multi-diplôme, binôme/trinôme et rôles, sans remplacer l'ergonomie personnelle.

Le script `scripts/check_personal_functional_lock.mjs` vérifie automatiquement la présence des points structurants dans le frontend.
