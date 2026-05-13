# Choix Méthodologique : UML vs MERISE

## 1) Comparaison entre UML et MERISE
La principale différence réside dans l'approche : 
- **Merise** sépare les données (Modèle Conceptuel de Données) des traitements (Modèle Conceptuel de Traitements). C'est une méthode rigoureuse mais parfois rigide pour les systèmes interactifs modernes.
- **UML (Unified Modeling Language)** regroupe les données et les traitements au sein d'"objets". Il se concentre sur la modélisation fonctionnelle et dynamique à travers différents diagrammes (Cas d'utilisation, Séquence, Classes).

## 2) Choix de UML
Nous avons choisi **UML** pour la conception de SiraGO pour les raisons suivantes :
- **Cohérence Technique** : SiraGO repose sur des technologies orientées objet (React Native pour le mobile, Node.js pour le backend, React pour l'admin). UML est le standard naturel pour ces environnements.
- **Précision du Tracking** : UML permet de modéliser les interactions dynamiques complexes, comme le **Tracking GPS en temps réel** et les **flux d'alertes SOS**, avec une précision que Merise ne permet pas d'atteindre facilement.
- **Flexibilité** : La nature itérative de notre développement (Agile) s'accorde mieux avec la souplesse des diagrammes UML.
