# Sécurité et confidentialité

ProPilot manipule potentiellement des données pédagogiques et des données concernant des élèves.

## Règles du dépôt public

Ne jamais publier dans ce dépôt :

- noms, prénoms, adresses e-mail ou identifiants d'élèves réels ;
- exports de classes ou sauvegardes JSON contenant des données personnelles ;
- documents CCF, PFMP ou travaux d'élèves réels ;
- mots de passe ;
- fichiers `.env` ;
- clés privées, service-role keys ou secrets techniques ;
- captures d'écran contenant des données nominatives d'élèves.

Les démonstrations du dépôt doivent utiliser uniquement des données fictives.

## Configuration

Les paramètres Supabase doivent être fournis via variables d'environnement :

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Une clé publique/publishable peut être utilisée côté navigateur lorsque le projet Supabase est correctement protégé par RLS. Les clés privées ne doivent jamais être intégrées au frontend.

## Données de production

Les données réelles restent dans Supabase et ne doivent pas être exportées vers GitHub.

## Signalement

Pendant le pilote, tout problème de sécurité ou de confidentialité doit être traité avant une mise en production élargie.
