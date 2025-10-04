# 🤝 Guide de Contribution - Agri-SHE

Merci de votre intérêt pour contribuer à Agri-SHE ! Ce document vous guidera à travers le processus de contribution.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Standards de Code](#standards-de-code)
- [Process de Pull Request](#process-de-pull-request)
- [Reporting de Bugs](#reporting-de-bugs)
- [Suggestions de Fonctionnalités](#suggestions-de-fonctionnalités)

## 📜 Code de Conduite

### Notre Engagement

Nous nous engageons à créer un environnement ouvert et accueillant pour tous les contributeurs.

### Nos Standards

**Comportements encouragés :**
- Utiliser un langage accueillant et inclusif
- Respecter les points de vue et expériences différents
- Accepter gracieusement les critiques constructives
- Se concentrer sur ce qui est meilleur pour la communauté

**Comportements inacceptables :**
- Commentaires insultants ou désobligeants
- Harcèlement public ou privé
- Publier des informations privées d'autrui
- Toute autre conduite non professionnelle

## 🚀 Comment Contribuer

### 1. Setup de l'Environnement de Développement

```bash
# Fork et clone le repo
git clone https://github.com/VOTRE-USERNAME/v2.git
cd v2

# Installer les dépendances
pnpm install

# Créer le fichier .env.local
cp .env.example .env.local

# Configurer MongoDB et autres variables d'environnement

# Lancer le serveur de dev
pnpm dev
```

### 2. Créer une Branche

```bash
# Créer une branche depuis main
git checkout main
git pull origin main
git checkout -b feature/nom-de-la-feature

# Convention de nommage des branches :
# feature/xxx  - Nouvelle fonctionnalité
# fix/xxx      - Correction de bug
# docs/xxx     - Documentation
# refactor/xxx - Refactoring
# test/xxx     - Tests
```

### 3. Faire vos Changements

- Écrivez du code propre et maintenable
- Suivez les conventions de code existantes
- Ajoutez des commentaires si nécessaire
- Mettez à jour la documentation si nécessaire

### 4. Tester vos Changements

```bash
# Vérifier les erreurs TypeScript
pnpm type-check

# Linter le code
pnpm lint

# Formatter le code
pnpm format

# Tester manuellement toutes les fonctionnalités affectées
```

### 5. Commit vos Changements

Utilisez des messages de commit clairs et descriptifs :

```bash
# Format recommandé :
git commit -m "type(scope): description courte

Description plus détaillée si nécessaire.

Fixes #123"
```

**Types de commit :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation seulement
- `style`: Changements de style (formatage, etc.)
- `refactor`: Refactoring du code
- `test`: Ajout de tests
- `chore`: Maintenance (dépendances, config, etc.)

**Exemples :**
```bash
feat(marketplace): add filter by price range
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
refactor(cart): simplify cart state management
```

### 6. Push et Créer une Pull Request

```bash
# Push vers votre fork
git push origin feature/nom-de-la-feature

# Créer une PR sur GitHub
# Remplir le template de PR avec toutes les informations
```

## 💻 Standards de Code

### TypeScript

- **Typage strict** : Toujours typer les variables, paramètres et retours
- **Interfaces** : Préférer les interfaces pour les objets
- **Types** : Utiliser les types pour les unions et intersections
- **Generics** : Utiliser les generics quand approprié

```typescript
// ✅ Bon
interface User {
  id: string
  name: string
  email: string
}

const getUser = async (userId: string): Promise<User> => {
  // ...
}

// ❌ Mauvais
const getUser = async (userId: any) => {
  // ...
}
```

### React Components

- **Functional Components** : Utiliser des fonctions, pas des classes
- **Hooks** : Utiliser les hooks appropriés
- **Props** : Typer toutes les props
- **Naming** : PascalCase pour les composants

```typescript
// ✅ Bon
interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={variant}>
      {children}
    </button>
  )
}

// ❌ Mauvais
export function Button(props: any) {
  return <button {...props} />
}
```

### API Routes

- **Validation** : Valider toutes les entrées
- **Authentification** : Vérifier JWT pour routes protégées
- **Error Handling** : Gérer toutes les erreurs
- **Status Codes** : Utiliser les codes HTTP appropriés

```typescript
// ✅ Bon
export async function POST(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Process...
    
    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### CSS & Styling

- **Tailwind CSS** : Utiliser Tailwind pour le styling
- **Composants UI** : Utiliser shadcn/ui quand possible
- **Responsive** : Mobile-first approach
- **Dark Mode** : Supporter le dark mode

```tsx
// ✅ Bon
<div className="flex flex-col gap-4 p-4 md:flex-row md:p-6">
  <Card className="flex-1">
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
</div>
```

### Naming Conventions

- **Variables** : camelCase
- **Constantes** : UPPER_SNAKE_CASE
- **Components** : PascalCase
- **Files** : kebab-case pour les fichiers, PascalCase pour les composants
- **Hooks** : use + camelCase (useAuth, useCart)

```typescript
// Variables
const userName = "John"
const isLoggedIn = true

// Constantes
const MAX_UPLOAD_SIZE = 5000000
const API_BASE_URL = "https://api.example.com"

// Components
function UserProfile() {}
function ProductCard() {}

// Hooks
function useAuth() {}
function useProducts() {}
```

## 📝 Process de Pull Request

### Template de PR

Votre PR doit inclure :

```markdown
## Description
Description claire de ce que fait la PR

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Changements
- Liste des changements effectués
- Fichiers modifiés
- Fonctionnalités ajoutées/supprimées

## Screenshots (si applicable)
Ajouter des screenshots pour les changements UI

## Tests
- [ ] Testé localement
- [ ] Tous les tests passent
- [ ] Pas d'erreurs TypeScript
- [ ] Code formatté

## Checklist
- [ ] Mon code suit les standards du projet
- [ ] J'ai commenté le code complexe
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de warnings
- [ ] J'ai ajouté des tests si nécessaire
```

### Review Process

1. **Automated Checks** : ESLint, TypeScript, Build
2. **Code Review** : Au moins un reviewer approuve
3. **Testing** : Tests manuels si nécessaire
4. **Merge** : Squash and merge après approbation

## 🐛 Reporting de Bugs

### Template de Bug Report

```markdown
## Description du Bug
Description claire et concise du bug

## Steps to Reproduce
1. Aller sur '...'
2. Cliquer sur '...'
3. Scroller vers '...'
4. Voir l'erreur

## Comportement Attendu
Ce qui devrait se passer

## Comportement Actuel
Ce qui se passe actuellement

## Screenshots
Si applicable

## Environnement
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]

## Informations Additionnelles
Tout contexte supplémentaire
```

## 💡 Suggestions de Fonctionnalités

### Template de Feature Request

```markdown
## Fonctionnalité Proposée
Description claire de la fonctionnalité

## Problème à Résoudre
Quel problème cette fonctionnalité résout-elle ?

## Solution Proposée
Comment cette fonctionnalité devrait fonctionner

## Alternatives Considérées
Autres solutions possibles

## Contexte Additionnel
Screenshots, mockups, exemples
```

## 📚 Ressources Utiles

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [shadcn/ui](https://ui.shadcn.com/)

### Outils Recommandés
- **VS Code** - Éditeur
- **MongoDB Compass** - GUI pour MongoDB
- **Postman** - Test des APIs
- **React DevTools** - Debug React
- **Prettier** - Formatage du code

## 🏆 Contributeurs

Merci à tous nos contributeurs !

<!-- Contributors list will be auto-generated -->

## ❓ Questions

Si vous avez des questions, n'hésitez pas à :
- Ouvrir une issue sur GitHub
- Contacter l'équipe sur Discord (lien à venir)
- Envoyer un email à dev@agri-she.tn

---

**Merci de contribuer à Agri-SHE ! 🌾**
