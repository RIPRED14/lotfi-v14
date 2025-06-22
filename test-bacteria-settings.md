# 🧪 Tests du Système de Paramètres des Bactéries

## ✅ Liste de vérification

### 1. Accès à la page de paramètres
- [ ] Naviguer vers `/bacteria-settings`
- [ ] Vérifier que la page se charge sans erreur
- [ ] Confirmer l'affichage des 12 bactéries configurées

### 2. Modification des délais
- [ ] Tester les boutons prédéfinis (12h, 24h, 48h, 3j, 5j, 7j)
- [ ] Utiliser les modificateurs rapides (+12h, +24h, -12h, -24h)
- [ ] Saisir manuellement un délai (ex: 36 heures)
- [ ] Vérifier la conversion automatique (36h → 1j 12h)

### 3. Activation/Désactivation
- [ ] Désactiver une bactérie (ex: Entérobactéries)
- [ ] Vérifier qu'elle disparaît des sélecteurs
- [ ] La réactiver
- [ ] Confirmer qu'elle réapparaît

### 4. Persistance des données
- [ ] Modifier plusieurs paramètres
- [ ] Rafraîchir la page (F5)
- [ ] Vérifier que les changements sont conservés

### 5. Réinitialisation
- [ ] Modifier plusieurs délais
- [ ] Cliquer sur "Réinitialiser aux valeurs par défaut"
- [ ] Confirmer le retour aux valeurs d'origine

### 6. Tests de compatibilité

#### Page Contrôle Qualité
- [ ] Naviguer vers `/quality-control`
- [ ] Vérifier le bouton "Paramètres" (coordinateurs)
- [ ] Cliquer pour accéder aux paramètres

#### Page Calendrier des lectures
- [ ] Naviguer vers `/lecture-calendar`
- [ ] Vérifier l'affichage des délais configurés
- [ ] Modifier un délai dans les paramètres
- [ ] Revenir au calendrier et confirmer la mise à jour

#### Composant BacteriaSelector
- [ ] Aller dans une page utilisant le sélecteur
- [ ] Vérifier l'affichage des bactéries avec délais
- [ ] Confirmer la synchronisation avec les paramètres

### 7. Interface utilisateur

#### Statistiques
- [ ] Vérifier le compteur total de bactéries
- [ ] Confirmer le nombre activées/désactivées
- [ ] Valider le calcul du délai moyen

#### Responsive Design
- [ ] Tester sur écran large (desktop)
- [ ] Tester sur écran moyen (tablette)
- [ ] Tester sur écran petit (mobile)

### 8. Validation des données

#### Valeurs limites
- [ ] Essayer de saisir 0 heure (doit être refusé)
- [ ] Essayer 1000 heures (doit être accepté)
- [ ] Tester des valeurs négatives (doivent être refusées)

#### Types de données
- [ ] Saisir du texte dans le champ délai
- [ ] Vérifier la validation/correction automatique

## 🎯 Scénarios d'utilisation

### Scénario 1 : Coordinateur modifie les délais
1. Se connecter en tant que coordinateur
2. Aller dans Contrôle Qualité → Paramètres
3. Modifier le délai des Entérobactéries de 24h à 36h
4. Modifier les Coliformes de 48h à 72h
5. Désactiver les Levures/Moisissures 3j
6. Enregistrer et revenir au menu principal
7. Vérifier que les changements apparaissent partout

### Scénario 2 : Planning de lecture mis à jour
1. Modifier le délai d'une bactérie courante
2. Aller dans le calendrier des lectures
3. Créer une nouvelle analyse avec cette bactérie
4. Vérifier que la date de lecture calculée correspond au nouveau délai

### Scénario 3 : Récupération après erreur
1. Modifier plusieurs paramètres
2. Fermer le navigateur brutalement
3. Rouvrir l'application
4. Vérifier que les paramètres sont conservés
5. Si problème, utiliser la réinitialisation

## 🐛 Points d'attention

### Erreurs possibles
- [ ] Console JavaScript sans erreurs
- [ ] Aucun warning TypeScript
- [ ] Pas de régression sur les fonctionnalités existantes

### Performance
- [ ] Temps de chargement < 3 secondes
- [ ] Réactivité de l'interface
- [ ] Pas de lag lors des modifications

### Données
- [ ] Cohérence entre les pages
- [ ] Synchronisation en temps réel
- [ ] Backup/restauration fonctionnelle

## 📋 Rapport de test

**Date du test :** ___________
**Testeur :** ___________
**Version :** 1.0

### Résultats
- [ ] ✅ Tous les tests passent
- [ ] ⚠️ Tests passent avec remarques mineures
- [ ] ❌ Problèmes critiques détectés

### Commentaires
```
_________________________________________________
_________________________________________________
_________________________________________________
```

### Bugs trouvés
```
_________________________________________________
_________________________________________________
_________________________________________________
```

### Améliorations suggérées
```
_________________________________________________
_________________________________________________
_________________________________________________
```

---

**✅ Tests réussis = Système prêt pour la production !** 