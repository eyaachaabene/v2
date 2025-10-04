# 📝 Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### À Venir
- Payment Gateway (Flouci, D17)
- Email & SMS Notifications
- Real-time Chat avec Socket.io
- Mobile App (React Native)
- Advanced Search avec Elasticsearch

## [2.0.0] - 2025-10-04

### 🎉 Ajouts Majeurs

#### 💼 Système d'Opportunités Complet
- Création d'opportunités (farmers & suppliers)
- Types: Seasonal Work, Training, Workshop, Technical Work, Part-time Job, Partnership
- Système de candidatures avec lettres de motivation
- Dashboard de gestion des candidatures
- Acceptation/Rejet des candidats
- Page de détails avec informations complètes
- Notifications automatiques

#### 🛒 Système de Panier & Commandes
- Contexte global de panier avec React Context
- Persistance dans localStorage
- CartSheet avec interface moderne
- Gestion temps réel des quantités
- Validation des stocks et quantités minimales
- Création de commandes complète
- Page de gestion des commandes
- Vue buyer/seller avec onglets
- Statuts multiples: pending, confirmed, processing, shipped, delivered, cancelled
- Notifications aux vendeurs

#### 🤖 Chatbot Intelligent en Tunisien
- Intelligence artificielle en dialecte tunisien
- Connaissances agricoles (irrigation, météo, marchés, emplois)
- Interface moderne avec gradients et animations
- Quick replies pour navigation rapide
- Support emoji et formatage riche
- Réponses contextuelles

#### 💰 Analyse de Prix Avancée
- Comparaison automatique avec marchés mondiaux
- Support de 12+ commodités (Wheat, Rice, Corn, Tomato, etc.)
- Statuts: optimal, too_high, too_low, volatile
- Recommandations personnalisées
- Notifications push pour ajustements
- Mode démo pour tests

#### 👥 Système de Profils & Social
- Profils utilisateurs complets
- Édition de profil avec upload d'avatar
- Système de connexions (amis)
- Statuts en ligne
- Statistiques sociales (followers, following, posts, connections)
- Paramètres de confidentialité
- Navigation vers messages depuis community

#### 🔔 Système de Notifications Complet
- Types multiples: price alerts, applications, opportunities, orders
- Badge avec compteur non lus
- Dropdown avec liste des notifications
- Mark as read au clic
- Filtrage par type
- Actions contextuelles

### 🔧 Améliorations

#### Navigation
- Ajout de l'icône panier avec compteur
- Lien vers page des commandes
- Intégration CartSheet
- Badge de notifications amélioré
- Menu utilisateur avec déconnexion

#### Marketplace
- Boutons "Add to Cart" pour produits et ressources
- Validation de disponibilité
- Messages de confirmation/erreur
- Filtres améliorés

#### Community
- Bouton "Message" pour utilisateurs connectés
- Redirection vers messagerie
- Système de connexion instantané
- Interface améliorée

#### Dashboard IoT
- Graphiques temps réel avec Chart.js
- Alertes automatiques
- Gestion des seuils
- Interface responsive

### 🐛 Corrections

#### Opportunités
- Fix: Cannot read properties of undefined (reading '_id')
- Fix: Objects are not valid as a React child (positions)
- Ajout de validations optionnelles pour provider
- Support des structures de données flexibles
- Gestion robuste des cas edge

#### API
- Amélioration de l'API /opportunities/:id avec fetch du provider
- Ajout de providerId comme fallback
- Meilleure gestion des erreurs
- Validation des ObjectIds

#### Profils
- Fix: Profile page data structure mismatch
- Correction des accès aux propriétés imbriquées
- Alignement interface frontend/backend
- Ajout du champ email dans les métadonnées

#### Price Analysis
- Fix: Type incompatibility pour createdAt
- Amélioration de la gestion du chargement
- Meilleure gestion des erreurs
- Affichage d'état de chargement

### 📚 Documentation
- README.md complet créé
- CONTRIBUTING.md avec guidelines
- CHANGELOG.md initialisé
- CART_SYSTEM.md détaillé
- Commentaires de code améliorés

### 🎨 UI/UX
- Design moderne et cohérent
- Animations et transitions fluides
- Responsive sur tous les écrans
- Dark mode support (partiel)
- Composants shadcn/ui intégrés

### 🔐 Sécurité
- JWT authentication renforcée
- Validation des entrées utilisateur
- Protection des routes sensibles
- Hashing bcrypt pour mots de passe
- Gestion des permissions par rôle

## [1.0.0] - 2025-09-15

### Ajouts Initiaux
- Architecture Next.js 14 avec App Router
- Système d'authentification JWT
- Pages principales: Dashboard, Marketplace, Community
- MongoDB Atlas integration
- Dashboard IoT basique
- Système de produits et ressources
- Navigation de base

### Infrastructure
- Setup MongoDB
- Configuration Tailwind CSS
- Integration shadcn/ui
- Scripts d'initialisation DB

---

## Types de Changements

- `Added` - Nouvelles fonctionnalités
- `Changed` - Changements dans des fonctionnalités existantes
- `Deprecated` - Fonctionnalités bientôt supprimées
- `Removed` - Fonctionnalités supprimées
- `Fixed` - Corrections de bugs
- `Security` - Corrections de vulnérabilités

## Versions

Format: `[MAJOR.MINOR.PATCH]`
- **MAJOR** - Changements incompatibles avec les versions précédentes
- **MINOR** - Nouvelles fonctionnalités compatibles
- **PATCH** - Corrections de bugs compatibles

---

**Dernière mise à jour**: 4 octobre 2025
