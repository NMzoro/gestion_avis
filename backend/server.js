import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import slugify from 'slugify';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));
app.use(bodyParser.json());

// Dossier uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});
const upload = multer({ storage });

// Connexion MySQL
let db;
(async () => {
  db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
})();

// SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Middleware Auth JWT
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];       // Récupère le header
  const token = authHeader && authHeader.split(' ')[1];  // "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'Token manquant.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;  // on peut accéder aux infos admin dans req.admin
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide ou expiré.' });
  }
};

// Routes Admin
app.post('/admin/register', async (req, res) => {
  try {
    const { nom, email, password } = req.body;
    if (!nom || !email || !password)
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });

    const [existing] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email déjà utilisé.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO admins (nom, email, password,otp) VALUES (?, ?, ?)', [nom, email, hashedPassword,null]);
    res.json({ message: 'Admin créé avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de l\'admin.' });
  }
});

app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });

    const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (admins.length === 0) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

    const token = jwt.sign({ id: admin.id, nom: admin.nom }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, nom: admin.nom, email: admin.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
});

// Générer un code OTP à 6 chiffres
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Route Forgot Password -> envoi OTP par email
app.post('/admin/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis.' });

    const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (admins.length === 0) {
      return res.status(404).json({ error: 'Aucun compte trouvé avec cet email.' });
    }

    const otp = generateOTP();

    // Sauvegarde OTP dans la DB
    await db.query('UPDATE admins SET otp = ? WHERE email = ?', [otp, email]);

    // Envoi email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Code de vérification (OTP)',
      html: `<p>Bonjour,</p>
             <p>Voici votre code de vérification :</p>
             <h2 style="color:blue;">${otp}</h2>
             <p>Ce code est valable 10 minutes.</p>`
    });

    res.json({ message: 'Un code OTP a été envoyé à votre email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'OTP." });
  }
});

// Vérification de l'OTP
app.post('/admin/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email et OTP requis.' });

    const [admins] = await db.query('SELECT * FROM admins WHERE email = ? AND otp = ?', [email, otp]);
    if (admins.length === 0) {
      return res.status(400).json({ error: 'OTP invalide.' });
    }

    // OTP correct -> on peut réinitialiser
    await db.query('UPDATE admins SET otp = NULL WHERE email = ?', [email]);

    res.json({ message: 'OTP validé. Vous pouvez maintenant changer le mot de passe.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la vérification de l'OTP." });
  }
});


// Changement du mot de passe
app.post('/admin/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email et nouveau mot de passe requis.' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query('UPDATE admins SET password = ? WHERE email = ?', [hashedPassword, email]);

    res.json({ message: "Mot de passe réinitialisé avec succès !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la réinitialisation du mot de passe." });
  }
});


// Fonction pour slug unique
const generateUniqueSlug = async (name) => {
  let baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 1;
  while (true) {
    const [rows] = await db.query('SELECT id FROM clients WHERE slug = ?', [slug]);
    if (rows.length === 0) break;
    slug = `${baseSlug}-${count}`;
    count++;
  }
  return slug;
};

// Delete client
app.delete('/clients/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get client to check if it exists and get logo filename
    const [clients] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
    if (clients.length === 0) return res.status(404).json({ error: 'Client non trouvé' });
    
    const client = clients[0];
    
    // Delete from database
    await db.query('DELETE FROM clients WHERE id = ?', [id]);
    
    // Delete logo file if exists
    if (client.logo) {
      const logoPath = path.join(uploadDir, client.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }
    
    res.json({ message: 'Client supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du client.' });
  }
});

// Routes protégées
app.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const [[{ totalClients }]] = await db.query('SELECT COUNT(*) AS totalClients FROM clients');
    const [[{ totalAvis }]] = await db.query('SELECT COUNT(*) AS totalAvis FROM avis');
    const [[{ avgNote }]] = await db.query('SELECT AVG(note) AS avgNote FROM avis');
    const moyenne = avgNote !== null ? Number(avgNote).toFixed(2) : '0.00';

    const [avisSemaine] = await db.query(
      `SELECT a.note, a.commentaire, a.contact, a.date_soumission, c.nom AS clientNom 
       FROM avis a JOIN clients c ON a.client_id = c.id 
       WHERE a.date_soumission >= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY a.date_soumission DESC`
    );

    const [clientsPerf] = await db.query(
      `SELECT c.id, c.nom, c.logo, AVG(a.note) AS moyenne 
       FROM clients c LEFT JOIN avis a ON c.id = a.client_id 
       GROUP BY c.id, c.nom, c.logo HAVING moyenne >= 4 ORDER BY moyenne DESC`
    );

    const clientsPerfFormatted = clientsPerf.map(c => ({
      ...c,
      moyenne: c.moyenne !== null ? Number(c.moyenne).toFixed(2) : '0.00'
    }));

    res.json({ totalClients, totalAvis, avgNote: moyenne, avisSemaine, clientsPerf: clientsPerfFormatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des stats dashboard.' });
  }
});

// Ajouter client
app.post('/clients', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const { nom, langue, business_statut,place_id, page_publique_url, statut, contact_nom, contact_email, contact_tel, notes_admin } = req.body;
    if (!nom || !langue) return res.status(400).json({ error: "Nom et langue sont obligatoires." });

    const [existingName] = await db.query('SELECT id FROM clients WHERE nom = ?', [nom]);
    if (existingName.length > 0) return res.status(400).json({ error: "Un client avec ce nom existe déjà." });

    const slug = await generateUniqueSlug(nom);
    const logo = req.file ? req.file.filename : null;
    const now = new Date();

    await db.query(
      `INSERT INTO clients 
      (nom, logo, slug, langue, business_statut,place_id, page_publique_url, statut, contact_nom, contact_email, contact_tel, notes_admin, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, logo, slug, langue, business_statut || null,place_id || null, page_publique_url || `http://localhost:3000/public/${slug}`, statut || 'actif', contact_nom || null, contact_email || null, contact_tel || null, notes_admin || null, now, now]
    );

    if (contact_email) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: contact_email,
        subject: 'Votre page publique est créée',
        html: `<p>Bonjour ${contact_nom || nom},</p>
               <p>Voici le lien de votre page publique: 
               <a href="http://localhost:3000/public/${slug}">Voir la page</a></p>
               <p>Accédez directement aux avis des consommateurs: 
               <a href="http://localhost:3000/public/${slug}/avis">Voir les avis</a></p>`
      });
    }

    res.json({ message: 'Client ajouté avec succès !', slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'ajout du client.' });
  }
});

// Get all clients
app.get('/clients', authMiddleware, async (req, res) => {
  try {
    const [clients] = await db.query(`
      SELECT * FROM clients 
      ORDER BY created_at DESC
    `);
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des clients.' });
  }
});

// Routes publiques
// Submit a review (public)
app.post('/clients/:slug/avis', async (req, res) => {
  try {
    const { slug } = req.params;
    const { note, commentaire, contact } = req.body;
    
    // Validation
    if (!note || note < 1 || note > 5) {
      return res.status(400).json({ error: 'Note invalide (doit être entre 1 et 5)' });
    }
    
    // Require comment for low ratings
    if (note <= 3 && (!commentaire || commentaire.trim() === '')) {
      return res.status(400).json({ error: 'Commentaire obligatoire pour les notes faibles' });
    }

    // Get client ID from slug
    const [clients] = await db.query('SELECT id FROM clients WHERE slug = ?', [slug]);
    if (clients.length === 0) return res.status(404).json({ error: 'Client non trouvé' });
    
    const clientId = clients[0].id;
    const now = new Date();

    // Insert review
    await db.query(
      'INSERT INTO avis (client_id, note, commentaire, contact, date_soumission) VALUES (?, ?, ?, ?, ?)',
      [clientId, note, commentaire || null, contact || null, now]
    );

    res.json({ message: 'Avis soumis avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la soumission de l\'avis.' });
  }
});
// Add this to your server.js
app.get('/clients/:slug/avis', async (req, res) => {
  try {
    const { slug } = req.params;
    const [clients] = await db.query('SELECT id FROM clients WHERE slug = ?', [slug]);
    if (clients.length === 0) return res.status(404).json({ error: 'Client non trouvé' });

    const clientId = clients[0].id;
    const [avis] = await db.query(
      'SELECT * FROM avis WHERE client_id = ? ORDER BY date_soumission DESC',
      [clientId]
    );
    
    res.json(avis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des avis.' });
  }
});

// Récupérer les infos de l'admin connecté
app.get('/admin/me', authMiddleware, async (req, res) => {
  try {
    const [admins] = await db.query('SELECT id, nom, email FROM admins WHERE id = ?', [req.admin.id]);
    if (admins.length === 0) return res.status(404).json({ error: 'Admin non trouvé.' });
    res.json(admins[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération de l'admin." });
  }
});

// Get single client by ID
app.get('/clients/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [clients] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
    if (clients.length === 0) return res.status(404).json({ error: 'Client non trouvé' });
    res.json(clients[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du client.' });
  }
});

// Modifier client avec mise à jour du slug et envoi d'email
app.put('/clients/:id', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nom, 
      langue, 
      business_statut, 
      place_id,
      statut, 
      contact_nom, 
      contact_email, 
      contact_tel, 
      notes_admin 
    } = req.body;

    // Vérifier si le client existe
    const [clients] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
    if (clients.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    const client = clients[0];
    let logo = client.logo;
    let slug = client.slug;

    // Regénérer le slug seulement si le nom a changé
    if (nom && nom !== client.nom) {
      slug = await generateUniqueSlug(nom);
    }

    // Si un nouveau logo est fourni
    if (req.file) {
      // Supprimer l'ancien logo s'il existe
      if (logo) {
        const oldLogoPath = path.join(uploadDir, logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      logo = req.file.filename;
    }

    // Mettre à jour le client avec le nouveau slug si nécessaire
    await db.query(
      `UPDATE clients SET 
        nom = ?, 
        logo = ?, 
        slug = ?,
        langue = ?, 
        business_statut = ?, 
        place_id = ?,
        statut = ?, 
        contact_nom = ?, 
        contact_email = ?, 
        contact_tel = ?, 
        notes_admin = ?, 
        updated_at = NOW() 
      WHERE id = ?`,
      [
        nom || client.nom,
        logo,
        slug,
        langue || client.langue,
        business_statut || client.business_statut,
        place_id || client.place_id,
        statut || client.statut,
        contact_nom || client.contact_nom,
        contact_email || client.contact_email,
        contact_tel || client.contact_tel,
        notes_admin || client.notes_admin,
        id
      ]
    );

    // Récupérer le client mis à jour
    const [updatedClients] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
    const updatedClient = updatedClients[0];

    // Envoyer un email si l'email de contact existe
    if (updatedClient.contact_email) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: updatedClient.contact_email,
          subject: 'Mise à jour de votre compte client',
          html: `<p>Bonjour ${updatedClient.contact_nom || updatedClient.nom},</p>
                 <p>Les informations de votre compte client ont été mises à jour.</p>
                 ${nom !== client.nom ? 
                   `<p><strong>Attention :</strong> Le nom de votre entreprise a changé, votre nouvelle URL de votre page publique est :</p>
                    <p><a href="http://localhost:3000/public/${updatedClient.slug}">Voir la page</a></p>` : 
                   `<p>Voici le lien de votre page publique: 
                    <a href="http://localhost:3000/public/${updatedClient.slug}">Voir la page</a></p>`}
                 <p>Accédez directement aux avis des consommateurs: 
                 <a href="http://localhost:3000/public/${updatedClient.slug}/avis">Voir les avis</a></p>
                 <p>Si vous n'avez pas demandé ces modifications, veuillez nous contacter immédiatement.</p>`
        });
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
        // On continue même si l'email échoue
      }
    }

    res.json({ 
      message: 'Client mis à jour avec succès',
      slug: updatedClient.slug // Retourner le nouveau slug au frontend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la modification du client.' });
  }
});


// Get all avis with client names (admin)
app.get('/avis', authMiddleware, async (req, res) => {
  try {
    const [avis] = await db.query(`
      SELECT a.*, c.nom AS client_nom 
      FROM avis a 
      LEFT JOIN clients c ON a.client_id = c.id
      ORDER BY a.date_soumission DESC
    `);
    res.json(avis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des avis.' });
  }
});

// Delete avis
app.delete('/avis/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM avis WHERE id = ?', [id]);
    res.json({ message: 'Avis supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'avis.' });
  }
});
// Modifier les infos de l'admin connecté
app.put('/admin/me', authMiddleware, async (req, res) => {
  try {
    const { nom, email, password,otp=null } = req.body;
    const updates = [];
    const values = [];

    if (nom) {
      updates.push("nom = ?");
      values.push(nom);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    }
        if (otp) {
      updates.push("otp = ?");
      values.push(otp);
    }

    if (updates.length === 0) return res.status(400).json({ error: "Aucune donnée à mettre à jour." });

    values.push(req.admin.id);
    await db.query(`UPDATE admins SET ${updates.join(", ")} WHERE id = ?`, values);

    res.json({ message: "Informations mises à jour avec succès !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'admin." });
  }
});



app.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [clients] = await db.query('SELECT * FROM clients WHERE slug = ?', [slug]);
    if (!clients.length) return res.status(404).json({ error: 'Client non trouvé' });
    res.json(clients[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});



// Servir logos
app.use('/uploads', express.static(uploadDir));

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
app.listen(PORT,HOST, () => console.log(`Server running on port ${PORT}`));
