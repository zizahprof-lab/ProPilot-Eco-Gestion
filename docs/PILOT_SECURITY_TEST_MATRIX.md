# Matrice de tests sécurité — pilote ProPilot

Cette branche prépare les contrôles avant pilote sans modifier l'interface de référence et sans déployer l'application.

## Invariants fonctionnels

- L'ergonomie professeur et élève de la V16 reste inchangée.
- Un professeur ne voit que les classes et élèves auxquels il est rattaché.
- Un élève ne voit que ses propres données, documents, progression, PFMP et CCF.
- Les notes, validations CCF et positionnements ne sont modifiables que par les rôles autorisés.
- Les documents élèves ne sont jamais exposés par une URL publique permanente.
- La suppression d'un document respecte les droits prévus côté professeur et côté élève.
- Aucun secret Supabase, fichier .env ou donnée réelle d'élève n'est versionné.

## Scénarios bloquants avant pilote

| ID | Scénario | Résultat attendu |
|---|---|---|
| SEC-01 | Élève A tente de lire les données de l'élève B | Refus |
| SEC-02 | Élève tente de modifier une note ou validation professeur | Refus |
| SEC-03 | Professeur A tente d'accéder à une classe non rattachée | Refus |
| SEC-04 | Utilisateur non authentifié appelle les tables pédagogiques | Refus |
| DOC-01 | Élève dépose un document CCF autorisé | Accepté |
| DOC-02 | Élève supprime son propre document CCF | Accepté selon règle métier |
| DOC-03 | Élève tente de supprimer le document d'un autre élève | Refus |
| DOC-04 | Professeur autorisé supprime un document élève | Accepté |
| PFMP-01 | Élève consulte ses informations PFMP | Accepté |
| PFMP-02 | Élève consulte la PFMP d'un autre élève | Refus |
| CCF-01 | Élève consulte son état d'avancement CCF | Accepté |
| CCF-02 | Élève modifie directement son état CCF | Refus |
| PROG-01 | Élève consulte sa progression | Accepté |
| PROG-02 | Élève modifie une validation de compétence professeur | Refus |

## Critère de passage

Le pilote ne passe en GO que lorsque tous les scénarios SEC, DOC, PFMP, CCF et PROG sont validés sur Supabase avec RLS active. Les contrôles d'interface ne remplacent jamais les contrôles côté base et stockage.
