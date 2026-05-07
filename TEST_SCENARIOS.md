# Test Scenarios — Portail intelligent de recrutement
Frontend: http://localhost:4200  |  Backend: http://localhost:8080

---

## Comptes de test

| Rôle      | Email                            | Mot de passe   |
|-----------|----------------------------------|----------------|
| ADMIN     | admin@recruitment.local          | Admin@12345    |
| RECRUITER | recruiter1@recruitment.local     | Password@123   |
| CANDIDATE | candidate3@recruitment.local     | Password@123   |

> Les comptes Recruiter et Candidate doivent être créés via la page `/register` (ou déjà en BDD si les migrations les ont insérés).

---

## 1. Authentification

### 1.1 Login valide
- Aller sur http://localhost:4200/login
- Saisir les identifiants Admin → vérifier redirection vers `/offers`
- Répéter pour Recruiter et Candidate

### 1.2 Login invalide
- Mauvais mot de passe → message d'erreur affiché, pas de redirection

### 1.3 Register (nouveau compte Candidate)
- Aller sur `/register` (lien depuis la page login : "Pas encore inscrit ?")
- Remplir : prénom, nom, email unique, mot de passe ≥ 8 caractères
- Soumettre → redirection automatique vers `/offers` (connecté d'emblée)
- Tester email déjà utilisé → message "Cette adresse e-mail est déjà utilisée."
- Tester mot de passe < 8 caractères → erreur de validation inline

### 1.4 Token expiré
- Modifier manuellement `jwt_token` dans localStorage → toute requête authentifiée redirige vers `/login`

### 1.5 Accès non autorisé
- Connecté en tant que Candidate → aller sur `/admin` → redirection vers `/unauthorized`
- Connecté en tant que Candidate → aller sur `/recruiter` → redirection vers `/unauthorized`
- Non connecté → aller sur `/my-applications` → redirection vers `/login`

---

## 2. Offres d'emploi (tous rôles, même non connecté)

### 2.1 Liste des offres
- Aller sur `/offers` → liste paginée (9 offres par page)
- Filtre par département → résultats mis à jour
- Filtre par mot-clé → recherche en temps réel (debounce 400ms)
- Filtre par statut (OPEN / CLOSED / DRAFT)
- Bouton "Réinitialiser" → tous les filtres effacés

### 2.2 Détail d'une offre
- Cliquer sur une offre → `/offers/:id`
- Vérifier : titre, description, département, lieu, contrat, date création, date clôture

---

## 3. Candidature (rôle CANDIDATE)

Se connecter avec le compte Candidate.

### 3.1 Postuler à une offre
- Aller sur `/offers` → ouvrir une offre OPEN
- Bouton "Postuler" visible → formulaire avec lettre de motivation + upload CV
- Choisir un fichier PDF/DOC → nom du fichier affiché
- Soumettre → message de succès, bouton "Postuler" disparaît ou devient "Déjà postulé"

### 3.2 Double candidature
- Tenter de postuler à la même offre → erreur serveur (409 ou 400)

### 3.3 Mes candidatures
- Aller sur `/my-applications`
- Vérifier : offre, score matching (ou "—"), date, statut coloré
- Statuts attendus : SUBMITTED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED, ACCEPTED, REJECTED, WITHDRAWN

### 3.4 Retirer une candidature
- Seules les candidatures SUBMITTED ou UNDER_REVIEW ont le bouton "Supprimer" (icône poubelle)
- Confirmer → candidature disparaît de la liste

---

## 4. Tableau de bord Recruteur (rôle RECRUITER ou ADMIN)

Se connecter avec le compte Recruiter.

### 4.1 Créer une offre
- Aller sur `/recruiter` → onglet "Mes offres"
- Bouton "+ Nouvelle offre" → formulaire
- Remplir titre (requis), département, lieu, contrat, compétences, description, date clôture (optionnel)
- Soumettre → offre apparaît dans la liste avec statut DRAFT

### 4.2 Modifier une offre
- Cliquer icône crayon → formulaire prérempli
- Modifier titre → sauvegarder → changement visible

### 4.3 Publier / Fermer une offre
- Icône "publish" sur une offre DRAFT → statut devient OPEN
- Icône "close" sur une offre OPEN → statut devient CLOSED
- Confirmer dans la dialog de confirmation

### 4.4 Supprimer une offre
- Icône poubelle → dialog de confirmation → offre supprimée

### 4.5 Voir les candidatures
- Onglet "Candidatures" → liste de toutes les candidatures pour les offres du recruteur
- Colonnes : Candidat, Offre, Date, Statut, Actions

### 4.6 Changer le statut d'une candidature
- Dropdown statut → choisir UNDER_REVIEW / SHORTLISTED / INTERVIEW_SCHEDULED / ACCEPTED / REJECTED
- Statut mis à jour, badge de couleur change

### 4.7 Planifier un entretien
- Bouton calendrier (icône event) sur une candidature → panneau s'ouvre en bas
- Remplir : date/heure, mode (Présentiel / Vidéo / Téléphone), lieu/lien (optionnel), notes (optionnel)
- Soumettre → message "Entretien planifié.", liste des candidatures se recharge

### 4.8 Évaluations
- Onglet "Évaluations"
- Sélectionner une candidature dans le dropdown
- Remplir score (0-100), décision (HIRE / REJECT / HOLD), commentaires
- Soumettre → évaluation apparaît dans le tableau en dessous
- Badge couleur : HIRE = vert, REJECT = rouge, HOLD = orange

---

## 5. Administration (rôle ADMIN)

Se connecter avec le compte Admin.

### 5.1 Liste des utilisateurs
- Aller sur `/admin`
- Statistiques : total, actifs, recruteurs, candidats, admins
- Tableau : nom, email, rôle (badge coloré), statut (actif/inactif), date création, actions

### 5.2 Activer / Désactiver un compte
- Icône personne/personne_off → dialog de confirmation
- Statut bascule entre Actif et Inactif

### 5.3 Changer le rôle d'un utilisateur
- Cliquer la flèche déroulante à côté du badge de rôle → menu avec ADMIN / RECRUITER / CANDIDATE
- Le rôle actuel est coché (grisé)
- Choisir un nouveau rôle → mise à jour immédiate du badge

### 5.4 Supprimer un utilisateur
- Icône poubelle rouge → dialog "Supprimer définitivement ?"
- Confirmer → utilisateur disparu de la liste

---

## 6. Profil (tous rôles connectés)

### 6.1 Accéder au profil
- Cliquer sur le menu utilisateur (en haut à droite) → "Mon profil"
- Ou naviguer directement sur `/profile`
- Vérifier : avatar avec initiales, rôle(s), statut du compte, prénom, nom, email, date inscription
- Si département / poste renseignés lors du register → affichés

---

## 7. Notifications (tous rôles connectés)

### 7.1 Icône de notifications
- Cloche en haut à droite → badge rouge si non lues
- Cliquer → liste des 5 dernières notifications

### 7.2 Marquer comme lue
- Cliquer sur une notification → elle passe en "lue" (icône check), compteur décrémenté

---

## 8. Navigation & Guards

| URL               | Non connecté     | CANDIDATE        | RECRUITER        | ADMIN            |
|-------------------|------------------|------------------|------------------|------------------|
| `/offers`         | ✅ Accessible    | ✅               | ✅               | ✅               |
| `/offers/:id`     | ✅ Accessible    | ✅               | ✅               | ✅               |
| `/login`          | ✅ Accessible    | ✅               | ✅               | ✅               |
| `/register`       | ✅ Accessible    | ✅               | ✅               | ✅               |
| `/my-applications`| → `/login`       | ✅               | ❌ `/unauthorized`| ❌ `/unauthorized`|
| `/recruiter`      | → `/login`       | ❌ `/unauthorized`| ✅               | ✅               |
| `/admin`          | → `/login`       | ❌ `/unauthorized`| ❌ `/unauthorized`| ✅               |
| `/profile`        | → `/login`       | ✅               | ✅               | ✅               |
| `/unauthorized`   | ✅ Accessible    | ✅               | ✅               | ✅               |

---

## 9. Scénario de bout-en-bout (End-to-End)

1. **Admin** crée le compte Recruiter via `/admin` (changer rôle d'un utilisateur existant)
2. **Recruiter** se connecte → crée une offre → la publie (statut OPEN)
3. **Candidate** se connecte → trouve l'offre → postule avec lettre de motivation + CV
4. **Recruiter** voit la candidature → change statut → UNDER_REVIEW
5. **Recruiter** planifie un entretien (mode Vidéo, date dans le futur)
6. **Recruiter** ajoute une évaluation : score 85, décision HIRE
7. **Recruiter** change statut → ACCEPTED
8. **Candidate** voit le statut ACCEPTED dans "Mes candidatures"
9. **Recruiter** ferme l'offre (statut CLOSED)
10. **Admin** désactive le compte Candidate (test de désactivation)
