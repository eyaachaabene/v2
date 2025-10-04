# 🌾 Agri-SHE Platform

**Plateforme Agricole Intelligente pour la Tunisie**

Une solution complète pour connecter agriculteurs, fournisseurs, acheteurs et partenaires dans l'écosystème agricole tunisien.

## 📋 Table des Matières

- [Aperçu](#aperçu)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Technologies Utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Structure du Projet](#structure-du-projet)
- [Fonctionnalités Détaillées](#fonctionnalités-détaillées)
- [API Documentation](#api-documentation)
- [Contribution](#contribution)

## 🎯 Aperçu

Agri-SHE est une plateforme web moderne qui révolutionne l'agriculture en Tunisie en offrant :
- 🛒 **Marketplace** - Achat/vente de produits agricoles et ressources
- 🤝 **Community** - Réseau social pour agriculteurs
- 💼 **Opportunities** - Opportunités d'emploi, formations et partenariats
- 📊 **IoT Dashboard** - Surveillance et gestion des capteurs agricoles
- 💰 **Price Analysis** - Analyse des prix du marché en temps réel
- 💬 **Messages** - Communication directe entre utilisateurs
- 📦 **Orders** - Gestion complète des commandes

## ✨ Fonctionnalités Principales

### 1. 🛒 Système de Marketplace Complet

#### Produits & Ressources
- **Affichage dynamique** avec filtres avancés (catégorie, prix, localisation)
- **Recherche intelligente** avec autocomplete
- **Cartes de produits** avec images, prix, et disponibilité
- **Vue détaillée** avec toutes les informations du produit/ressource

#### Panier d'Achat
- **Contexte global** avec React Context API
- **Persistance** dans localStorage
- **Gestion temps réel** des quantités et totaux
- **Validation** des stocks et quantités minimales
- **Interface moderne** avec sheet/drawer
- **Checkout** simplifié et sécurisé

#### Gestion des Commandes
- **Vue complète** des commandes (buyer/seller)
- **Statuts multiples** : pending, confirmed, processing, shipped, delivered, cancelled
- **Historique détaillé** avec timeline
- **Filtrage** par statut et recherche
- **Notifications** automatiques aux vendeurs

### 2. 🤝 Réseau Social Communautaire

#### Publications & Interactions
- **Création de posts** avec texte, images et tags
- **Système de likes** et commentaires
- **Partage** de connaissances agricoles
- **Catégories** : Success Story, Question, Knowledge Sharing, Weather Alert

#### Connexions & Messagerie
- **Système d'amis** avec demandes de connexion
- **Suggestions** d'agriculteurs à suivre
- **Chat en temps réel** (prévu)
- **Profils utilisateurs** détaillés

#### Chatbot Tunisien 🤖
- **Intelligence artificielle** en dialecte tunisien
- **Connaissances agricoles** (irrigation, météo, marchés, emplois)
- **Interface moderne** avec gradients et animations
- **Quick replies** pour navigation rapide
- **Support emoji** et formatage riche

### 3. 💼 Hub d'Opportunités

#### Types d'Opportunités
- **Seasonal Work** - Travail saisonnier
- **Part-time Job** - Emploi à temps partiel
- **Technical Work** - Travail technique
- **Training** - Formations
- **Workshop** - Ateliers
- **Partnership** - Partenariats

#### Gestion des Opportunités
- **Création** (farmers & suppliers uniquement)
- **Candidatures** avec lettre de motivation
- **Système de tracking** des applications
- **Acceptation/Rejet** des candidats
- **Dashboard** pour gérer les candidatures
- **Notifications** automatiques

#### Détails Complets
- Localisation (gouvernorat, ville, adresse)
- Compensation et durée
- Exigences et compétences
- Dates de début et deadline
- Informations de contact

### 4. 📊 Tableau de Bord IoT

#### Surveillance des Capteurs
- **Types de capteurs** : température, humidité, humidité du sol, pH, luminosité
- **Graphiques en temps réel** avec Chart.js
- **Alertes automatiques** pour valeurs anormales
- **Historique** des mesures
- **Configuration** des seuils d'alerte

#### Gestion des Dispositifs
- **Ajout/Suppression** de capteurs
- **Statut** (active/inactive)
- **Localisation** des capteurs
- **Dernière mise à jour** affichée

### 5. 💰 Analyse des Prix

#### Intelligence de Marché
- **Comparaison automatique** avec les prix du marché mondial
- **Commodités supportées** : Wheat, Rice, Corn, Tomato, Potato, Onion, Apple, Orange, Banana, Olive Oil, Sugar, Coffee
- **Recommandations** personnalisées
- **Statuts** : optimal, too_high, too_low, volatile
- **Notifications push** pour ajustements de prix

#### Analytics
- **Différence** en pourcentage avec le marché
- **Tendances** de prix
- **Historique** des analyses
- **Mode démo** pour tester

### 6. 👤 Système de Profils

#### Profils Utilisateur
- **Informations complètes** : nom, avatar, localisation, bio
- **Rôles** : farmer, supplier, buyer, admin
- **Statistiques sociales** : followers, following, posts, connections
- **Paramètres de confidentialité**
- **Vérification** de compte

#### Gestion de Profil
- **Édition** des informations personnelles
- **Upload** d'avatar
- **Configuration** de la localisation
- **Langues** et centres d'intérêt
- **Informations de contact** avec contrôle de visibilité

### 7. 💬 Système de Messages

#### Communication
- **Messages directs** entre utilisateurs connectés
- **Liste des conversations** avec preview
- **Statut en ligne** des utilisateurs
- **Messages non lus** avec compteur
- **Navigation** depuis la community

### 8. 🔔 Système de Notifications

#### Types de Notifications
- **Price Alerts** - Alertes de prix
- **New Applications** - Nouvelles candidatures
- **Application Status** - Changements de statut
- **Opportunity Updates** - Mises à jour d'opportunités
- **Order Updates** - Statut des commandes

#### Fonctionnalités
- **Badge** avec compteur non lus
- **Dropdown** avec liste des notifications
- **Mark as read** au clic
- **Filtrage** par type
- **Actions** contextuelles

## 🚀 Technologies Utilisées

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling moderne
- **shadcn/ui** - Composants UI réutilisables
- **Chart.js** - Graphiques et visualisations
- **Lucide React** - Icônes
- **Sonner** - Notifications toast

### Backend
- **Next.js API Routes** - API RESTful
- **MongoDB** - Base de données NoSQL
- **MongoDB Atlas** - Cloud database
- **JWT** - Authentification sécurisée
- **bcryptjs** - Hashing des mots de passe

### Services Externes
- **Commodity API** - Prix du marché en temps réel
- **Firebase** (prévu) - Storage pour images
- **Vercel Analytics** - Analytics

### DevOps
- **Git** - Version control
- **pnpm** - Package manager
- **ESLint** - Linting
- **TypeScript** - Type checking

## 📦 Installation

### Prérequis
```bash
Node.js >= 18.0.0
pnpm >= 8.0.0
MongoDB Atlas account
```

### Étapes d'Installation

1. **Cloner le repository**
```bash
git clone https://github.com/eyaachaabene/v2.git
cd v2
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configuration de l'environnement**
Créer un fichier `.env.local` :
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Commodity API (optional)
COMMODITY_API_KEY=your-commodity-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Initialiser la base de données**
```bash
node scripts/setup-database.js
```

5. **Lancer le serveur de développement**
```bash
pnpm dev
```

6. **Accéder à l'application**
```
http://localhost:3000
```

## 📁 Structure du Projet

```
v2/
├── app/                          # Pages Next.js (App Router)
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentification
│   │   ├── products/             # Produits
│   │   ├── resources/            # Ressources
│   │   ├── orders/               # Commandes
│   │   ├── opportunities/        # Opportunités
│   │   ├── messages/             # Messages
│   │   ├── notifications/        # Notifications
│   │   ├── iot/                  # Capteurs IoT
│   │   ├── price-analysis/       # Analyse de prix
│   │   └── users/                # Utilisateurs
│   ├── auth/                     # Pages d'authentification
│   ├── marketplace/              # Page marketplace
│   ├── community/                # Réseau social
│   ├── opportunities/            # Hub d'opportunités
│   ├── orders/                   # Gestion des commandes
│   ├── messages/                 # Messagerie
│   ├── iot/                      # Dashboard IoT
│   ├── price-analysis/           # Analyse de prix
│   ├── profile/                  # Profils utilisateurs
│   └── dashboard/                # Dashboard principal
├── components/                   # Composants React
│   ├── ui/                       # Composants UI de base
│   ├── dashboard-nav.tsx         # Navigation principale
│   ├── chatbot-widget.tsx        # Chatbot tunisien
│   ├── cart-sheet.tsx            # Panier d'achat
│   ├── add-opportunity-form.tsx  # Formulaire opportunité
│   ├── opportunity-applications.tsx  # Gestion candidatures
│   └── ...
├── contexts/                     # React Contexts
│   └── cart-context.tsx          # Contexte panier global
├── hooks/                        # Custom React Hooks
│   ├── use-auth.ts               # Hook authentification
│   ├── use-products.ts           # Hook produits
│   ├── use-opportunities.ts      # Hook opportunités
│   ├── use-notifications.ts      # Hook notifications
│   ├── use-add-to-cart.ts        # Hook panier
│   └── ...
├── lib/                          # Utilitaires et configs
│   ├── mongodb.ts                # Configuration MongoDB
│   ├── auth-middleware.ts        # Middleware JWT
│   ├── models/                   # Types TypeScript
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Opportunity.ts
│   │   └── ...
│   └── utils.ts                  # Fonctions utilitaires
├── public/                       # Assets statiques
│   ├── images/                   # Images
│   └── favicon.ico               # Icône du site
├── scripts/                      # Scripts d'initialisation
│   ├── setup-database.js         # Setup DB
│   └── populate-sample-data.js   # Données de test
└── docs/                         # Documentation
    ├── CART_SYSTEM.md            # Doc système panier
    ├── mongodb-schema.md         # Schéma MongoDB
    └── backend-api-structure.md  # Structure API
```

## 🔐 Authentification & Autorisation

### Rôles Utilisateurs
- **Farmer** - Agriculteur (peut créer opportunités, vendre produits)
- **Supplier** - Fournisseur (peut créer opportunités, vendre ressources)
- **Buyer** - Acheteur (peut acheter et postuler)
- **Admin** - Administrateur (accès complet)

### Routes Protégées
Toutes les API routes sensibles utilisent le middleware JWT :
```typescript
const token = await verifyToken(request)
if (!token) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

### Permissions
- **Create Opportunity** : farmer, supplier uniquement
- **View Applications** : propriétaire de l'opportunité
- **Edit Profile** : propriétaire du profil
- **Create Order** : utilisateurs authentifiés

## 🗄️ Schéma de Base de Données

### Collections MongoDB

#### Users
```typescript
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  role: "farmer" | "supplier" | "buyer" | "admin",
  profile: {
    firstName: string,
    lastName: string,
    phone: string,
    avatar: string,
    location: {
      governorate: string,
      city: string,
      coordinates: { lat: number, lng: number }
    }
  },
  socialProfile: { bio, website, socialLinks },
  socialStats: { followers, following, posts, connections },
  friends: [{ user: ObjectId, addedAt: Date }],
  connections: [{ user: ObjectId, status: string }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Products
```typescript
{
  _id: ObjectId,
  farmerId: ObjectId,
  name: string,
  description: string,
  category: string,
  images: string[],
  pricing: { price: number, unit: string, currency: string },
  stock: { quantity: number, unit: string },
  location: { governorate, city },
  status: "available" | "out_of_stock",
  createdAt: Date
}
```

#### Resources
```typescript
{
  _id: ObjectId,
  supplierId: ObjectId,
  name: string,
  category: string,
  pricing: { price: number, minimumOrder: number },
  stock: { available: number },
  status: "available" | "unavailable",
  createdAt: Date
}
```

#### Opportunities
```typescript
{
  _id: ObjectId,
  postedBy: ObjectId,
  title: string,
  description: string,
  type: "seasonal_work" | "training" | "workshop" | ...,
  location: { governorate, city, address },
  positions: { available: number, filled: number },
  compensation: { type, amount, currency },
  applicationDeadline: Date,
  status: "active" | "filled" | "expired",
  createdAt: Date
}
```

#### Orders
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [{
    id: string,
    name: string,
    quantity: number,
    price: number,
    type: "product" | "resource"
  }],
  total: number,
  status: "pending" | "confirmed" | "shipped" | "delivered",
  createdAt: Date
}
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/logout` - Se déconnecter

### Products
- `GET /api/products` - Liste des produits (avec filtres)
- `GET /api/products/:id` - Détails d'un produit
- `POST /api/products` - Créer un produit (farmer)
- `PATCH /api/products/:id` - Modifier un produit
- `DELETE /api/products/:id` - Supprimer un produit

### Resources
- `GET /api/resources` - Liste des ressources
- `GET /api/resources/:id` - Détails d'une ressource
- `POST /api/resources` - Créer une ressource (supplier)

### Orders
- `GET /api/orders` - Mes commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders/:id` - Détails d'une commande
- `PATCH /api/orders/:id` - Modifier statut

### Opportunities
- `GET /api/opportunities` - Liste des opportunités
- `GET /api/opportunities/:id` - Détails d'une opportunité
- `POST /api/opportunities` - Créer une opportunité
- `POST /api/opportunities/:id/apply` - Postuler
- `GET /api/opportunities/:id/applications` - Liste des candidatures

### Messages
- `GET /api/messages` - Mes conversations
- `POST /api/messages` - Envoyer un message
- `GET /api/messages/:userId` - Messages avec un utilisateur

### Notifications
- `GET /api/notifications` - Mes notifications
- `PATCH /api/notifications/:id/read` - Marquer comme lu

### IoT
- `GET /api/iot/sensors` - Mes capteurs
- `POST /api/iot/sensors` - Ajouter un capteur
- `GET /api/iot/sensors/:id/data` - Données du capteur

### Price Analysis
- `GET /api/price-analysis` - Mes analyses
- `POST /api/price-analysis` - Lancer une analyse

## 🎨 Composants UI Réutilisables

### shadcn/ui Components
- Button, Card, Input, Textarea
- Select, Dialog, Sheet, Tabs
- Badge, Avatar, Dropdown Menu
- Alert, Toast, Calendar
- Chart, Table, Accordion

### Custom Components
- `DashboardNav` - Navigation principale avec cart
- `ChatbotWidget` - Assistant IA tunisien
- `CartSheet` - Panier coulissant
- `OpportunityCard` - Carte d'opportunité
- `OpportunityApplications` - Gestion candidatures
- `AddOpportunityForm` - Formulaire création

## 🌍 Internationalisation

### Langues Supportées
- Français (principale)
- Arabe Tunisien (chatbot)
- Anglais (partiel)

### Chatbot Tunisien
Le chatbot comprend et répond en dialecte tunisien avec :
- Greetings : "Ahla", "Salam", "Yahasra"
- Questions agricoles
- Support emoji contextuel
- Recommandations locales

## 🔄 Fonctionnalités à Venir

### Court Terme
- [ ] Payment Gateway (Flouci, D17)
- [ ] Email Notifications
- [ ] SMS Notifications
- [ ] Advanced Search avec Elasticsearch
- [ ] Product Reviews & Ratings

### Moyen Terme
- [ ] Mobile App (React Native)
- [ ] Real-time Chat avec Socket.io
- [ ] Video Calls pour formations
- [ ] AI Recommendations
- [ ] Weather Integration

### Long Terme
- [ ] Blockchain pour traçabilité
- [ ] Drone Integration
- [ ] Marketplace B2B
- [ ] Export/Import Management
- [ ] Multi-language Full Support

## 🧪 Tests

### Lancer les Tests
```bash
# Tests unitaires (à venir)
pnpm test

# Tests E2E (à venir)
pnpm test:e2e
```

## 📊 Performance

### Optimisations Implémentées
- Server-side rendering (SSR)
- Image optimization avec Next.js
- Code splitting automatique
- Lazy loading des composants
- Caching avec React Query
- MongoDB indexing

## 🤝 Contribution

### Guidelines
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Code Style
- Utiliser TypeScript pour tous les nouveaux fichiers
- Suivre les conventions ESLint
- Documenter les fonctions complexes
- Écrire des tests pour les nouvelles features

## 📝 License

Ce projet est sous licence privée - voir le fichier LICENSE pour plus de détails.

## 👥 Équipe

**Team Agri-SHE**
- Product Owner
- Full Stack Developers
- UI/UX Designers
- IoT Engineers

## 📧 Contact

Pour toute question ou suggestion :
- Email: contact@agri-she.tn
- GitHub: [eyaachaabene](https://github.com/eyaachaabene)

## 🙏 Remerciements

- shadcn pour les composants UI
- Vercel pour l'hébergement
- MongoDB Atlas pour la base de données
- La communauté agricole tunisienne

---

**Fait avec ❤️ pour l'agriculture tunisienne**
