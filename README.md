# Guide d'installation du projet

## Étape 1 : Cloner le projet
Clonez le projet sur votre machine.

## Étape 2 : Installation du Front-end
1. Accédez au dossier `front-end`
2. Exécutez la commande :
   ```bash
   npm install
   ```
3. Ajoutez un fichier `.env` contenant la ligne suivante :
   ```env
   VITE_BACKEND_URL='http://localhost:5000'
   ```

## Étape 3 : Installation du Back-end
1. Accédez au dossier `back-end`
2. Exécutez la commande :
   ```bash
   npm install
   ```
3. Ajoutez un fichier `.env` contenant les informations suivantes :
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=gestion__avis_clients
   JWT_SECRET=MonSuperSecret123!
   SMTP_USER=mohamedbouhaddou37@gmail.com
   SMTP_PASS="slaq dhbx jzdd jbnz"
   ```

⚠️ **Attention** : Ne partagez pas ce dépôt publiquement car il contient un mot de passe sensible lié à l'adresse email.

## Étape 4 : Démarrage du projet
- Pour le **front-end**, exécutez :
  ```bash
  npm run dev
  ```
- Pour le **back-end**, exécutez :
  ```bash
  node server.js
  ```

## Informations de connexion
Page de connexion :
- **Email** : `admin@example.com`
- **Mot de passe** : `admin123`
