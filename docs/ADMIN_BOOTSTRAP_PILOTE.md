# Compte administrateur — procédure pilote

Cette procédure sert à créer le **premier compte administrateur réel** sans auto-promotion et sans exposer de clé serveur dans le navigateur.

## Préconditions
- GitHub Pages activé sur la branche `pilot-site`, dossier `/ (root)`.
- Le compte utilise une adresse `@ac-aix-marseille.fr`.
- Le professeur choisit lui-même son mot de passe.
- Aucun mot de passe n’est communiqué à un tiers.

## Étapes
1. Ouvrir l’URL pilote ProPilot.
2. Choisir **Créer un compte → Enseignant**.
3. Saisir le nom affiché, l’adresse académique et un mot de passe personnel.
4. Valider l’e-mail si Supabase demande une confirmation.
5. Le compte arrive en **attente d’approbation** avec le rôle `teacher`.
6. Relever l’identifiant technique du compte côté Supabase.
7. Exécuter uniquement côté serveur la fonction privée `private.pp_bootstrap_admin(uuid)`.
8. Vérifier que le profil devient `role='admin'` et `approved=true`.
9. Se reconnecter : l’entrée **Administration** doit apparaître.
10. Vérifier l’onglet Professeurs, le compteur `0/10`, les filtres et l’approbation d’un compte test.

## Sécurité
- Aucun premier utilisateur n’est promu automatiquement administrateur.
- La fonction de bootstrap reste privée et n’est pas appelable depuis le navigateur.
- Le compte admin n’entre pas dans la limite des 10 professeurs pilotes.
- L’administrateur n’a pas accès par défaut aux données nominatives des élèves des collègues.
- La limite serveur bloque un 11e professeur approuvé pendant le pilote.

## Test minimum avant ouverture aux collègues
- inscription du compte admin ;
- promotion explicite ;
- déconnexion / reconnexion ;
- inscription d’un professeur test ;
- apparition dans **En attente** ;
- approbation depuis l’interface admin ;
- connexion du professeur approuvé ;
- création d’une première classe ;
- retour Bugs / RETEX.
