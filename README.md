# Bibliothèque Numérique DIT — Frontend

Interface web développée avec React et Vite pour la gestion de la bibliothèque académique du Dakar Institute of Technology.

## Architecture du projet

```
src/
├── components/       # Composants réutilisables
│   ├── Layout.jsx    # Header et sidebar partagés entre toutes les pages
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx  # Gestion de l'authentification et de la session
├── pages/
│   ├── Login.jsx        # Page de connexion
│   ├── Register.jsx     # Page d'inscription
│   ├── Dashboard.jsx    # Tableau de bord avec statistiques
│   ├── Books.jsx        # Gestion des livres
│   ├── Borrowings.jsx   # Gestion des emprunts
│   └── Profile.jsx      # Profil utilisateur
├── services/
│   └── apiService.js    # Tous les appels API centralisés
├── styles/              # Fichiers CSS par page
└── main.jsx             # Point d'entrée
```

## Prérequis

- Node.js v14 ou supérieur
- npm
- Le backend doit être démarré et accessible

## Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet frontend :

```env
VITE_API_URL=http://localhost:3000/api/v1
```

> Si le backend tourne sur un port différent, adapter cette valeur en conséquence.

### 3. Démarrer l'application

**Mode développement :**
```bash
npm run dev
```

L'application est accessible sur `http://localhost:5173`

**Build de production :**
```bash
npm run build
```

**Prévisualiser le build :**
```bash
npm run preview
```

## Fonctionnalités par page

### Connexion et inscription (`/login`, `/register`)
- Formulaire de connexion avec afficher/masquer le mot de passe
- Inscription avec choix de la fonction : Étudiant, Professeur, Personnel administratif
- Redirection automatique vers le tableau de bord après connexion

### Tableau de bord (`/dashboard`)
- Statistiques en temps réel chargées depuis l'API
- Affichage adapté selon la fonction de l'utilisateur connecté
  - **Admin** : total de tous les livres, tous les emprunts, emprunts en cours, retards
  - **Autres** : livres disponibles, leurs propres emprunts
- Navigation latérale avec indication de la page active

### Bibliothèque (`/books`)
- Liste de tous les livres avec recherche par titre, auteur ou ISBN
- **Admin uniquement** : ajouter, modifier, supprimer un livre
- Tous les utilisateurs : emprunter un livre (durée de 30 jours)

### Emprunts (`/borrowings`)
- **Admin** : voir tous les emprunts de tous les utilisateurs
- **Autres** : voir uniquement ses propres emprunts
- Filtres par statut : Tous, En cours, En retard, Retournés
- Compteur de jours de retard pour les emprunts dépassés
- Retourner un livre directement depuis la liste
- Modal de détails pour chaque emprunt

### Profil (`/profile`)
- Affichage des informations du compte : prénom, nom, email, fonction
- Modification du prénom et du nom uniquement
- Changement de mot de passe avec vérification de l'ancien

## Gestion des rôles

L'interface s'adapte automatiquement selon la fonction de l'utilisateur connecté.

| Fonctionnalité | Étudiant / Professeur | Admin |
|---|---|---|
| Voir les livres | Oui | Oui |
| Emprunter un livre | Oui | Oui |
| Ajouter un livre | Non | Oui |
| Modifier un livre | Non | Oui |
| Supprimer un livre | Non | Oui |
| Voir ses emprunts | Oui | Oui |
| Voir tous les emprunts | Non | Oui |

## Authentification

La session est gérée avec un token JWT stocké dans le `localStorage`. Le token est automatiquement ajouté à chaque requête via un intercepteur Axios.

Si le token expire ou est invalide, l'utilisateur est redirigé vers la page de connexion.

**En cas de problème de session** (page blanche, redirection en boucle), vider le `localStorage` depuis la console du navigateur :

```javascript
localStorage.clear()
```

Puis recharger la page.

## Dépendances principales

- **React 18** — interface utilisateur
- **React Router v6** — navigation entre les pages
- **Axios** — appels HTTP vers le backend
- **Vite** — outil de build et serveur de développement

## Branche de développement

Les améliorations du frontend sont développées sur la branche :

```
feature/samuel-frontend
```

Pour créer une branche et basculer dessus :
```bash
git checkout -b feature/prenom-frontend
```

Pour pousser le travail en ligne :
```bash
git add .
git commit -m "feat: amélioration du frontend"
git push origin feature/prenom-frontend
```