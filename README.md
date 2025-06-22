# V13 - Application d'Analyse Microbiologique

## 📖 Description

Application web moderne pour la gestion et l'analyse microbiologique d'échantillons alimentaires. Cette application permet aux coordinateurs de créer des formulaires d'échantillons et aux techniciens de réaliser les analyses et lectures microbiologiques.

## 🚀 Fonctionnalités

### 👥 Gestion des Utilisateurs
- **Coordinateurs** : Création et gestion des formulaires d'échantillons
- **Techniciens** : Réalisation des analyses organoleptiques et lectures microbiologiques

### 🧪 Gestion des Échantillons
- Création de formulaires d'échantillons
- Saisie des paramètres organoleptiques (Odeur, Texture, Goût, Aspect, pH)
- Sélection des bactéries à analyser
- Suivi du statut des échantillons

### 🦠 Analyse Microbiologique
- Sélection de 9 types de bactéries avec délais d'incubation :
  - Entérobactéries (24h)
  - Escherichia coli (24h) 
  - Coliformes totaux (48h)
  - Staphylocoques (48h)
  - Listeria (48h)
  - Levures/Moisissures (72h)
  - Flore totales (72h)
  - Leuconostoc (96h)
  - Levures/Moisissures 5j (120h)

### 📊 Statuts et Workflow
- **Brouillon** : Formulaire en cours de création
- **Analyses en cours** : Échantillons en attente d'analyse organoleptique
- **Lectures en attente** : Échantillons ensemencés en attente de lecture
- **Terminé** : Analyses complètes

## 🛠️ Technologies

- **Frontend** : React + TypeScript + Vite
- **UI** : Tailwind CSS + shadcn/ui
- **Backend** : Supabase (PostgreSQL + Auth + RLS)
- **Icônes** : Lucide React

## 📦 Installation

1. **Cloner le projet**
```bash
git clone https://github.com/RIPRED14/v13.git
cd v13
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
Créer un fichier `.env` avec vos clés Supabase :
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

## 🗃️ Structure de la Base de Données

### Tables principales
- `samples` : Échantillons avec paramètres organoleptiques
- `form_bacteria_selections` : Sélections de bactéries par formulaire
- `batch_numbers` : Numéros de lots associés

### Colonnes importantes
- `form_id` : Identifiant unique du formulaire
- `status` : Statut de l'échantillon (draft, waiting_reading, completed)
- `created_at` / `modified_at` : Timestamps de création/modification

## 🔐 Authentification

Le système utilise Supabase Auth avec des rôles personnalisés :
- `coordinator` : Accès complet aux formulaires
- `technician` : Accès aux analyses et lectures

## 🎨 Interface Utilisateur

- Design moderne avec Tailwind CSS
- Composants réutilisables avec shadcn/ui
- Interface responsive
- Système de notifications toast
- Indicateurs visuels de statut par couleur

## 🧪 Tests et Debug

Le projet inclut de nombreux scripts de test et de diagnostic :
- Scripts de vérification de la base de données
- Tests de fonctionnalités spécifiques
- Outils de debug pour le développement

## 📝 Développement

### Scripts disponibles
- `npm run dev` : Serveur de développement
- `npm run build` : Build de production
- `npm run preview` : Aperçu du build
- `npm run lint` : Vérification ESLint

### Contribution
1. Forker le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commiter les changements (`git commit -m 'Add AmazingFeature'`)
4. Pusher vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

RIPRED14

## 🚨 Statut du Projet

✅ **Fonctionnel** - Application en cours de développement avec toutes les fonctionnalités de base implémentées.

### Dernières corrections
- ✅ Correction du problème de sauvegarde des bactéries
- ✅ Résolution des erreurs de colonnes de base de données
- ✅ Amélioration du workflow de statuts
- ✅ Optimisation de l'interface utilisateur
