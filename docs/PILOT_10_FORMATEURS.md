# ProPilot 2026 — Pilote de 10 enseignants
Dernière revue : 10 octobre 2026. Statut : **prêt pour recette encadrée, pas encore GO général**.

## Objectif et confidentialité
Valider le service avec dix PLP volontaires avant une ouverture plus large. Employer des élèves **fictifs** pour les premiers essais ; ne partager ni codes élèves ni données personnelles dans les captures, tickets ou échanges collectifs. Ne pas utiliser de données sensibles réelles tant que la recette de sécurité n'est pas signée.

## Répartition des dix scénarios (un référent par scénario)
| Testeur | Mission principale | Validation attendue |
|---|---|---|
| T01 | Inscription professeur, approbation, première connexion | Parcours complet sans blocage |
| T02 | Création 2MRC, progression, évaluation C1/C2/C3 | Aucun CCF ; AP exclues **uniquement** de l'évaluation |
| T03 | MCVA, contexte et positionnements | Correspondance contexte/compétences |
| T04 | MCVB, synthèse, saisies multiples | Résultats cohérents et persistants |
| T05 | Bac Pro Métiers de l'accueil | Débrief et grille 26 critères ; dépôts E31/E32 seulement |
| T06 | CAP EPC | 101 critères ; EP1/EP2/EP3 ; **pas d'économie-droit** |
| T07 | AGOrA | Trois groupes, progression, CCF selon diplôme |
| T08 | Binôme/trinôme, rôles propriétaire/éditeur/lecteur | Permissions et collaboration cohérentes |
| T09 | Élève : connexion, renouvellement du code, autoévaluation, visibilité | Ancien code invalidé ; aucune donnée d'autrui |
| T10 | Pièces jointes, PFMP, documents, impression, Bugs/RETEX | Documents accessibles selon droits, rendu correct |

## Recette par parcours
Chaque testeur passe les étapes suivantes : (1) créer/ouvrir une classe ; (2) créer un contexte et associer des compétences ; (3) évaluer un élève sur deux compétences, enregistrer une observation, rouvrir la page ; (4) vérifier les valeurs enregistrées ; (5) effectuer un débrief PFMP ; (6) tester synthèse et proposition de maîtrise ; (7) activer l'accès d'un élève fictif, lui remettre un code et vérifier la connexion ; (8) tester autoévaluation et visibilité ; (9) tester CCF seulement si le diplôme en prévoit ; (10) imprimer/exporter et soumettre le RETEX.

## Cas de sécurité non négociables
- Deux professeurs distincts, dans des classes sans relation, ne peuvent lire ni modifier les élèves de l'autre.
- Deux élèves distincts ne peuvent accéder aux données ni documents de l'autre.
- Un élève ne peut modifier une évaluation professeur, une synthèse validée ou une note CCF.
- Un lecteur ne peut pas saisir des évaluations ni changer des accès.
- Les liens documentaires protégés ne deviennent jamais publics ou permanents.
- Renouveler un code élève rend l'ancien code inutilisable ; pas de récupération du code précédent.

## Fiche de remontée pour chaque incident
Identifiant : PILOT-001… ; date ; testeur (T01–T10) ; diplôme ; module ; résultat attendu ; résultat obtenu ; étapes de reproduction ; navigateur ; capture **anonymisée** ; impact ; sévérité : **P0** fuite de données / accès non autorisé, **P1** blocage du parcours essentiel ou perte de données, **P2** défaut gênant avec contournement, **P3** présentation.

## Critères de passage GO/NO-GO
**NO-GO immédiat** si anomalie P0/P1 ouverte ou si les tests d'isolement professeur/élève ne sont pas signés. **GO encadré** lorsque les dix comptes enseignants ont été testés, les six parcours diplôme ont été parcourus, les scénarios de `docs/PILOT_SECURITY_TEST_MATRIX.md` sont validés, CI et déploiement sont verts, aucune anomalie P0/P1 non résolue, et une personne responsable du support / retour arrière est désignée. Le simple succès des tests statiques GitHub ne vaut pas test de sécurité réel.

## Exploitation
Période conseillée : semaine 1 prise en main et comptes fictifs ; semaine 2 saisies, scénarios croisés, correction et décision GO. Centraliser les remontées dans **Bugs / RETEX**, faire un point quotidien de 15 min, geler les nouveautés pendant la recette, conserver une version précédente prête au retour arrière.

## Notice enseignants et élèves
- Enseignant : crée son compte, attend la validation de l'administrateur, crée sa classe et sa progression.
- Élève : **ne crée pas son propre compte** ; le professeur renseigne l'e-mail, active l'accès, enregistre les droits, génère le code. L'élève se connecte avec son e-mail et ce code comme mot de passe.
- Contrôler les autorisations de visibilité avant chaque remise d'identifiants.
- Les suggestions IA restent soumises à vérification par le professeur.
- Le module économie-droit n'est pas disponible pour le CAP EPC ; le CCF n'est pas attendu en 2MRC.

## Point d'attention Supabase
Avis de sécurité non résolu : protection contre les mots de passe compromis désactivée. Document officiel : https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection. Activation par l'administrateur du projet et contrôle des éventuelles exigences de mots de passe avant GO.
