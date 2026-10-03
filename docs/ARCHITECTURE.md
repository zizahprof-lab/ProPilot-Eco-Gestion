# Architecture ProPilot

## Frontend

- React
- Vite
- PWA
- interface professeur basée sur l'ergonomie de la version personnelle
- espace élève séparé

## Backend

Supabase :
- Auth ;
- PostgreSQL ;
- Row Level Security ;
- Storage privé ;
- fonctions RPC pour les parcours sensibles.

## Modèle d'accès

### Professeur principal
Gestion complète de la classe et de l'équipe.

### Co-propriétaire
Gestion de la classe selon les droits de collaboration prévus.

### Éditeur
Peut travailler sur les données pédagogiques de la classe sans gérer sa propriété.

### Lecture seule
Consultation sans modification.

### Élève
Accède uniquement à son propre dossier et aux modules explicitement publiés par le professeur.

### Administrateur
Administration technique et gestion du pilote. L'administration ne doit pas donner automatiquement accès aux données nominatives élèves des classes des collègues.

## Référentiels

Le diplôme est défini au niveau de chaque classe. Il pilote automatiquement :
- groupes de compétences ;
- compétences ;
- ressources associées ;
- économie-droit ;
- épreuves et CCF.

## Confidentialité

GitHub contient le code. Supabase contient les données réelles.

Aucune donnée nominative élève ne doit être versionnée dans ce dépôt public.
