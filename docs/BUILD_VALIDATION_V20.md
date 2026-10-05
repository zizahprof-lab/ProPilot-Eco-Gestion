# Validation build V20

Cette branche prépare la validation CI du build de production sans déploiement public.

## Étapes automatiques
1. Installation Node 22
2. Installation des dépendances npm
3. Exécution de tous les contrôles ProPilot
4. Exécution de `vite build`

## État local
- Tous les contrôles statiques/fonctionnels passent.
- Import CSV désormais testé réellement avec séparateur virgule/point-virgule, BOM, CRLF, champs entre guillemets, séparateurs internes et guillemets doublés.
- Le build local reste bloqué uniquement par le téléchargement des dépendances npm dans l’environnement de travail actuel.

## Condition de GO
Le pilote ne passe pas en GO tant que le workflow CI ne construit pas réellement le frontend et que les sessions navigateur multi-comptes n’ont pas été validées.
