# Sistema de Panier (Shopping Cart)

## Fonctionnalités Ajoutées

### 1. Contexte de Panier Global
- **Fichier**: `contexts/cart-context.tsx`
- **Fonctionnalités**:
  - Gestion d'état global du panier avec React Context
  - Persistance automatique dans localStorage
  - Actions: ajouter, supprimer, modifier quantité, vider panier
  - Calcul automatique des totaux et compteurs

### 2. Composant de Panier (Sheet)
- **Fichier**: `components/cart-sheet.tsx`
- **Fonctionnalités**:
  - Interface utilisateur moderne avec sheet/drawer
  - Affichage des articles avec images et détails
  - Contrôles de quantité avec validation
  - Calcul des totaux en temps réel
  - Bouton de checkout pour passer commande

### 3. Hook d'Ajout au Panier
- **Fichier**: `hooks/use-add-to-cart.ts`
- **Fonctionnalités**:
  - Validation de disponibilité des produits/ressources
  - Respect des quantités minimales pour les ressources
  - Vérification des stocks disponibles
  - Messages d'erreur informatifs

### 4. API de Commandes
- **Fichier**: `app/api/orders/route.ts`
- **Fonctionnalités**:
  - Création de commandes avec validation
  - Mise à jour automatique des stocks
  - Notifications pour vendeurs/fournisseurs
  - Authentification JWT requise

### 5. Page de Commandes
- **Fichier**: `app/orders/page.tsx`
- **Fonctionnalités**:
  - Affichage de toutes les commandes utilisateur
  - Filtrage par statut (pending, confirmed, shipped, etc.)
  - Détails complets de chaque commande
  - Interface moderne avec onglets

### 6. Intégration Marketplace
- **Modifications**: `app/marketplace/page.tsx`
- **Nouvelles fonctionnalités**:
  - Boutons "Add to Cart" pour produits et ressources
  - Validation de disponibilité avant ajout
  - Messages de confirmation/erreur

### 7. Navigation Améliorée
- **Modifications**: `components/dashboard-nav.tsx`
- **Ajouts**:
  - Icône de panier avec compteur d'articles
  - Lien vers la page des commandes
  - Intégration du composant CartSheet

### 8. Layout Principal
- **Modifications**: `app/layout.tsx`
- **Ajouts**:
  - Provider de contexte panier global
  - Notifications toast avec Sonner

## Utilisation

### Ajouter un Article au Panier
```tsx
import { useAddToCart } from "@/hooks/use-add-to-cart"

const { addProductToCart, addResourceToCart } = useAddToCart()

// Pour un produit
addProductToCart(product, quantity)

// Pour une ressource  
addResourceToCart(resource, quantity)
```

### Accéder au Panier
```tsx
import { useCart } from "@/contexts/cart-context"

const { state, addToCart, removeFromCart, updateQuantity } = useCart()

// État du panier
console.log(state.items) // Articles
console.log(state.total) // Total
console.log(state.itemCount) // Nombre d'articles
```

### Passer une Commande
1. Ajouter des articles au panier via marketplace
2. Cliquer sur l'icône panier dans la navigation
3. Vérifier les articles et quantités
4. Cliquer sur "Proceed to Checkout"
5. La commande est créée et le panier vidé

## Structure de Données

### CartItem
```typescript
interface CartItem {
  id: string
  name: string
  description: string
  price: number
  currency: string
  unit: string
  quantity: number
  image?: string
  category: string
  type: 'product' | 'resource'
  supplierId?: string
  farmerId?: string
  minimumOrder?: number
  maxQuantity?: number
}
```

### Order
```typescript
interface Order {
  _id: string
  userId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress?: ShippingAddress
  notes?: string
  createdAt: string
  updatedAt: string
}
```

## Validations

### Produits
- Vérification du statut de disponibilité
- Respect des quantités en stock
- Prévention d'ajout de produits épuisés

### Ressources
- Vérification du statut "available"
- Respect des quantités minimales de commande
- Vérification des stocks disponibles

## Notifications
- Confirmation d'ajout au panier
- Erreurs de validation explicites
- Succès lors de la création de commande
- Notifications pour vendeurs/fournisseurs

## Pages Créées/Modifiées

### Nouvelles Pages
- `/orders` - Liste des commandes utilisateur

### Pages Modifiées
- `/marketplace` - Boutons d'ajout au panier
- Layout principal - Providers et notifications

### Nouveaux Composants
- `CartSheet` - Interface du panier
- `CartIndicator` - Indicateur de panier
- `EditProfileDialog` - Modification du profil
- `UserItemsGrid` - Grille d'articles utilisateur

Le système de panier est maintenant complètement fonctionnel et intégré dans l'application !