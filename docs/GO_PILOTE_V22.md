# Décision GO / NO-GO — ProPilot 2026, phase pilote 10 enseignants
Mis à jour : 10 octobre 2026.

## Validations techniques disponibles
- [x] CI : contrôles des rôles, collaboration, onboarding, accès élèves, CCF et documents.
- [x] Vérifications supplémentaires des règles pédagogiques de six diplômes (`scripts/check_pilot_curricula.mjs`).
- [x] Compilation de production vérifiée par GitHub Actions.
- [x] Plan de recette et répartition de dix scénarios : `docs/PILOT_10_FORMATEURS.md`.
- [x] Matrice de tests de sécurité définie : `docs/PILOT_SECURITY_TEST_MATRIX.md`.
- [x] Tables pédagogiques Supabase configurées en RLS (contrôler à nouveau avant ouverture).

## Conditions bloquantes non encore validées
- [ ] Recette d'isolement réel avec **deux professeurs et deux élèves** indépendants (lecture/écriture/RLS/storage).
- [ ] Connexion réelle, approbation, déconnexion, réinitialisation des identifiants et renouvellement d'un code élève.
- [ ] Un parcours complet de chaque diplôme (2MRC / MCVA / MCVB / ACCUEIL / EPC / AGORA).
- [ ] Contrôle réel de la cohérence évaluation / PFMP / autoévaluation / synthèse.
- [ ] Contrôle des dépôts et suppressions de pièces CCF sur les diplômes concernés.
- [ ] Vérification de l'URL de production sur navigateur Windows, Android/iPad, impression et navigation clavier.
- [ ] Activer / statuer sur l'avertissement Supabase Auth **Leaked Password Protection Disabled**.
- [ ] Désigner le responsable support, la procédure de signalement et le retour arrière.
- [ ] Au moins un retour formalisé par testeur, aucune anomalie P0/P1 ouverte.

## État décisionnel
**NO-GO pour une ouverture large à des comptes réels non supervisés.** La mise à disposition d'un environnement de **recette encadrée avec comptes fictifs** est possible après vérification manuelle de l'URL et du parcours d'authentification. Ce statut ne doit pas être présenté comme une certification de sécurité.

## Plan de retour arrière
En cas de régression majeure, suspendre les nouvelles inscriptions / autorisations, prévenir les pilotes, noter la version de déploiement, restaurer via le dernier commit ou build réputé stable ; ne jamais faire de rollback de schéma sans plan de migration et sauvegarde vérifiés.

## Ressources
- [Guide des dix pilotes](PILOT_10_FORMATEURS.md)
- [Matrice de sécurité](PILOT_SECURITY_TEST_MATRIX.md)
- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
