# Résultats des tests d’intégration V18

Tests exécutés transactionnellement sur Supabase, sans conserver les comptes ou données de test.

## Rôles professeur
- Propriétaire principal : lecture, modification pédagogique et gestion de classe autorisées.
- Co-propriétaire : lecture, modification pédagogique et gestion de classe autorisées.
- Éditeur : lecture et modification pédagogique autorisées, gestion de classe refusée.
- Lecture seule : lecture autorisée, toute modification refusée.
- Professeur extérieur : aucun accès à une classe non rattachée.
- Professeur en attente : aucun accès pédagogique.

## Confidentialité élève
- Un élève ne voit que sa propre ligne élève.
- Autoévaluation sur son propre compte : autorisée.
- Autoévaluation d’un autre élève : refusée.
- Modification directe d’un résultat CCF professeur : refusée.
- Dépôt CCF personnel : autorisé.

## Suppression de documents
Les tests réels ont révélé qu’une suppression SQL directe d’un document élève pouvait retourner 0 ligne, car la politique SELECT brute reste volontairement fermée aux élèves.

Correction appliquée en Supabase V261 :
- RPC `pp_delete_my_document(uuid)` ;
- propre pièce CCF, même validée : suppression autorisée ;
- document d’un autre élève : refus ;
- propre document hors CCF validé : refus ;
- propre document hors CCF encore déposé / à vérifier : suppression autorisée.

La politique de stockage confirme :
- lecture de sa pièce CCF : autorisée ;
- suppression de sa propre pièce CCF validée : autorisée ;
- lecture d’une pièce CCF déposée par le professeur si le CCF est publié : autorisée ;
- suppression d’une pièce déposée par le professeur : refusée.

## Administration
- L’administrateur n’accède pas aux lignes brutes des classes ou élèves de ses collègues.
- Le catalogue technique administrateur reste disponible sans données nominatives élèves.
- Un professeur en attente ne peut ni s’auto-approuver ni se promouvoir administrateur.
- Un administrateur peut approuver un professeur.

## Invitations et capacités
- Une invitation correspondante est visible par le professeur approuvé.
- Acceptation d’une invitation : rôle attribué correctement.
- Refus d’une invitation : statut `declined` conservé.
- Un professeur non approuvé ne peut accepter une invitation.
- Les invitations d’un professeur non approuvé sont masquées.
- Capacité binôme / trinôme vérifiée côté serveur ; une invitation surnuméraire est refusée.

## État sécurité
Audit Supabase : 0 alerte de sécurité après V261.
