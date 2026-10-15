import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Server Secret for HMAC Token Signing
const SERVER_SECRET = process.env.SESSION_SECRET || 'baby-world-super-secret-key-2026-ayaan-alhamdulillah';

// Gemini Client Setup
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Initial Seed Database
interface DBStructure {
  owner: {
    passwordHash: string;
    salt: string;
    ownerName: string;
    ownerEmail: string;
    isDefaultPassword: boolean;
  };
  settings: {
    babyName: string;
    birthDate: string;
    birthTime: string;
    birthWeight: string;
    birthLength: string;
    parentsNames: string;
    welcomeTitle: string;
    welcomeMessage: string;
    theme: 'pink' | 'blue' | 'lavender' | 'cream' | 'mint';
    heroImageUrl: string;
    heroImagePlaceholderType: 'bear' | 'cradle' | 'stars' | 'clouds';
    showAge: boolean;
    showBirthDetails: boolean;
    showBlessings: boolean;
    showTimeline: boolean;
    showCountdown: boolean;
    allowVisitorDownloads: boolean;
    ambientMusicEnabled: boolean;
    ambientTrack: string;
    updatedAt: string;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    iconName: string;
    orderIndex: number;
  }>;
  memories: Array<{
    id: string;
    title: string;
    caption: string;
    alternativeCaptions?: Array<{ style: string; text: string }>;
    imageUrl: string;
    thumbnailUrl?: string;
    category: string;
    tags: string[];
    memoryDate: string;
    uploadDate: string;
    status: 'published' | 'draft';
    isFavorite: boolean;
    orderIndex: number;
    ownerNotes?: string;
    visualDetailsObserved?: string;
  }>;
  timeline: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    milestoneLabel?: string;
    photoUrl?: string;
    orderIndex: number;
  }>;
  blessings: Array<{
    id: string;
    text: string;
    translationOrNote?: string;
    author?: string;
    orderIndex: number;
  }>;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function getInitialDb(): DBStructure {
  const initialSalt = crypto.randomBytes(16).toString('hex');
  const defaultPassword = process.env.ADMIN_PASSWORD || 'BabyLove2026!';
  const initialPasswordHash = hashPassword(defaultPassword, initialSalt);

  return {
    owner: {
      passwordHash: initialPasswordHash,
      salt: initialSalt,
      ownerName: 'Baby Ayaan Walidain',
      ownerEmail: 'osamakhan102020@gmail.com',
      isDefaultPassword: true,
    },
    settings: {
      babyName: 'Baby Ayaan',
      birthDate: '2026-08-15',
      birthTime: '06:45 AM',
      birthWeight: '3.4 kg',
      birthLength: '51 cm',
      parentsNames: 'Muhammad & Fatima',
      welcomeTitle: 'Hamari Duniya Mein Khush Aamdeed, Pyare Baby!',
      welcomeMessage:
        'Alhamdulillah! Hamari zindagi mein ek nanhi si jaan ki amad hui hai. Is choti si muskurahat ne hamari duniya ko khushiyon, mohabbat aur umeed ke naye rangon se bhar diya hai. Allah hamare pyare baby ko sehat, khushiyan, lambi zindagi aur hamesha apni hifazat mein rakhe. Ameen.',
      theme: 'cream',
      heroImageUrl: '',
      heroImagePlaceholderType: 'bear',
      showAge: true,
      showBirthDetails: true,
      showBlessings: true,
      showTimeline: true,
      showCountdown: true,
      allowVisitorDownloads: true,
      ambientMusicEnabled: true,
      ambientTrack: 'soft-lullaby',
      updatedAt: new Date().toISOString(),
    },
    categories: [
      { id: 'cat-1', name: 'Pehli Tasveer', slug: 'pehli-tasveer', iconName: 'Camera', orderIndex: 1 },
      { id: 'cat-2', name: 'Hamari Nanhi Jaan', slug: 'hamari-nanhi-jaan', iconName: 'Heart', orderIndex: 2 },
      { id: 'cat-3', name: 'Pyari Si Muskurahat', slug: 'pyari-si-muskurahat', iconName: 'Smile', orderIndex: 3 },
      { id: 'cat-4', name: 'Neend Ke Haseen Lamhe', slug: 'neend-ke-haseen-lamhe', iconName: 'Moon', orderIndex: 4 },
      { id: 'cat-5', name: 'Baby Ki Pehli Eid', slug: 'baby-ki-pehli-eid', iconName: 'Sparkles', orderIndex: 5 },
      { id: 'cat-6', name: 'Pehli Muskurahat', slug: 'pehli-muskurahat', iconName: 'Sun', orderIndex: 6 },
      { id: 'cat-7', name: 'Pehla Qadam', slug: 'pehla-qadam', iconName: 'Footprints', orderIndex: 7 },
      { id: 'cat-8', name: 'Birthday Memories', slug: 'birthday-memories', iconName: 'Cake', orderIndex: 8 },
      { id: 'cat-9', name: 'Family Ke Sath', slug: 'family-ke-sath', iconName: 'Users', orderIndex: 9 },
      { id: 'cat-10', name: 'Rozana Ki Pyari Yaadein', slug: 'rozana-ki-pyari-yaadein', iconName: 'Calendar', orderIndex: 10 },
      { id: 'cat-11', name: 'Special Moments', slug: 'special-moments', iconName: 'Star', orderIndex: 11 },
    ],
    memories: [
      {
        id: 'mem-1',
        title: 'Hamari Zindagi Ka Sab Se Khoobsurat Lamha',
        caption:
          'Is nanhi si jaan ki masoom neend dekh kar dil ko ajeeb sa sukoon milta hai. Allah meri pyari si jaan ko hamesha apni hifazat mein rakhe aur iski zindagi khushiyon se bhar de. Ameen.',
        alternativeCaptions: [
          { style: 'Dua', text: 'Allah is nanhi si jaan ko har buri nazar se mehfooz farmaye aur hamesha khush-o-khurram rakhe. Ameen.' },
          { style: 'Poetic', text: 'Choti si hatheliyon mein sari kainaat ka noor simat aya hai.' },
          { style: 'Cute', text: 'Neend ki pyari si pariyon ke des mein khoya hamara chota sa shehzada.' },
        ],
        imageUrl: '/sample-art/sleeping-baby.svg',
        category: 'Neend Ke Haseen Lamhe',
        tags: ['neend', 'masoomiyat', 'sukoon', 'pyari-jaan'],
        memoryDate: '2026-08-16',
        uploadDate: '2026-08-16T12:00:00.000Z',
        status: 'published',
        isFavorite: true,
        orderIndex: 1,
        visualDetailsObserved: 'Nanhe hath chehre ke qareeb, narm cream blanket mein lipta baby aaram se so raha hai.',
      },
      {
        id: 'mem-2',
        title: 'Ek Muskurahat, Hazaron Khushiyan',
        caption:
          'Is pyari si muskurahat mein hamari sari duniya basi hui hai. Tumhari choti si hansi hamare har din ko khaas bana deti hai. Hamesha yunhi muskurate rehna, meri jaan.',
        alternativeCaptions: [
          { style: 'Emotional', text: 'Jab yeh choti si ankhien muskurati hain toh sara gham bhool jata hai.' },
          { style: 'Cute', text: 'Doodh peete peete ek shararti si muskurahat!' },
          { style: 'Dua', text: 'Rab kare yeh pyari si hansi hamesha tere labon par sajji rahe. Ameen.' },
        ],
        imageUrl: '/sample-art/smiling-baby.svg',
        category: 'Pyari Si Muskurahat',
        tags: ['muskurahat', 'khushiyan', 'choti-hansi', 'dil-ka-tukra'],
        memoryDate: '2026-08-25',
        uploadDate: '2026-08-25T14:30:00.000Z',
        status: 'published',
        isFavorite: true,
        orderIndex: 2,
        visualDetailsObserved: 'Baby ke labon par halki si gulabi muskurahat aur chamakti hui masoom ankhien.',
      },
      {
        id: 'mem-3',
        title: 'Hamari Duniya Ka Sab Se Pyara Sitara',
        caption:
          'Choti si dress, masoom sa chehra aur bepanah pyar. Hamari zindagi ka yeh khoobsurat tohfa har lamhe ko yaadgar bana raha hai.',
        alternativeCaptions: [
          { style: 'Poetic', text: 'Aasman se utra ek noorani sitara jo hamare ghar ka chiragh ban gaya.' },
          { style: 'Family', text: 'Maa aur Baap ke dil ka qaraar, hamara pyara sa bacha.' },
          { style: 'Cute', text: 'Nanhe booties aur chota sa kurta, kitna pyara lag raha hai!' },
        ],
        imageUrl: '/sample-art/baby-dress.svg',
        category: 'Hamari Nanhi Jaan',
        tags: ['nanhi-jaan', 'tohfa', 'khubsoorat', 'pehli-yaad'],
        memoryDate: '2026-09-02',
        uploadDate: '2026-09-02T16:15:00.000Z',
        status: 'published',
        isFavorite: true,
        orderIndex: 3,
        visualDetailsObserved: 'Pastel baby suit mein saje nanhe hath paon aur khilkhilata chehra.',
      },
      {
        id: 'mem-4',
        title: 'Mohabbat Ki Narm Si Aaghosh',
        caption:
          'Is nanhi si jaan ko pyar se lipta dekh kar dil mohabbat se bhar jata hai. Kaash waqt kuch dair ke liye tham jaye aur hum is pyare se lamhe ko hamesha mehsoos kar saken.',
        alternativeCaptions: [
          { style: 'Warmth', text: 'Maa ki mamta aur baap ki duaoon ka saya har dam tumhare sath hai.' },
          { style: 'Poetic', text: 'Narm resham jaisi choti ungliyan jab hamare hath ko thaamti hain.' },
          { style: 'Dua', text: 'Allah pak hamesha apni hifazat aur noor mein qayam rakhe. Ameen.' },
        ],
        imageUrl: '/sample-art/swaddled-baby.svg',
        category: 'Pehli Tasveer',
        tags: ['aaghosh', 'mamta', 'swaddle', 'barkat'],
        memoryDate: '2026-08-15',
        uploadDate: '2026-08-15T10:00:00.000Z',
        status: 'published',
        isFavorite: false,
        orderIndex: 4,
        visualDetailsObserved: 'Narm blanket mein swaddle kiya hua baby, aaraam de aalam mein.',
      },
    ],
    timeline: [
      {
        id: 'time-1',
        title: 'Hamari Zindagi Ka Sab Se Pyara Din',
        description: 'Alhamdulillah! Subah 6:45 baje hamare aangan mein ek pyari si nanhi jaan ne qadam rakha. Zindagi naye rangon se roshan ho gayi.',
        date: '2026-08-15',
        milestoneLabel: 'Pehla Din - Amad',
        photoUrl: '/sample-art/swaddled-baby.svg',
        orderIndex: 1,
      },
      {
        id: 'time-2',
        title: 'Ghar Aane Ka Mubarak Din',
        description: 'Hospital se ghar aate hi har taraf khushiyon ki dhoom thi. Dadi, Nani aur sub ne phoolon aur duaoon se baby ka istiqbaal kiya.',
        date: '2026-08-17',
        milestoneLabel: 'Ghar Istiqbaal',
        orderIndex: 2,
      },
      {
        id: 'time-3',
        title: 'Pehli Pyari Muskurahat',
        description: 'Aaj subah jab Mama ne baby ko bulaya toh chehre par ek aisi meethi muskurahat aayi jis ne dil jeet liya.',
        date: '2026-08-25',
        milestoneLabel: 'Pehli Smile',
        photoUrl: '/sample-art/smiling-baby.svg',
        orderIndex: 3,
      },
      {
        id: 'time-4',
        title: 'Choti Si Awazien Aur Sharartien',
        description: 'Ab baby choti choti awazien nikal kar sub se baatein karne ki koshish karta hai. Har roz ek naya aur haseen tajruba hai.',
        date: '2026-09-15',
        milestoneLabel: 'Nanhi Awazien',
        orderIndex: 4,
      },
    ],
    blessings: [
      {
        id: 'bless-1',
        text: 'Ya Allah, hamare baby ko sehat, khushiyan, nek naseeb aur kamyabi ata farma. Ameen.',
        author: 'Mama Aur Papa Ki Dua',
        orderIndex: 1,
      },
      {
        id: 'bless-2',
        text: 'Ya Allah, is nanhi si jaan ko har buri nazar aur har pareshani se mehfooz rakh. Ameen.',
        author: 'Dadi Aur Dada Ki Dua',
        orderIndex: 2,
      },
      {
        id: 'bless-3',
        text: 'Iski zindagi mohabbat, sukoon, ilm aur khushiyon se bhar de. Ameen.',
        author: 'Nani Aur Nana Ki Dua',
        orderIndex: 3,
      },
      {
        id: 'bless-4',
        text: 'Rabbi hab li minas saliheen — Aye mere Rab, mujhe nek aur saleh aulaad ata farma aur isko ankhon ki thandak bana. Ameen.',
        author: 'Quranic Dua',
        orderIndex: 4,
      },
    ],
  };
}

function readDb(): DBStructure {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db:', err);
    return getInitialDb();
  }
}

function writeDb(data: DBStructure): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db:', err);
  }
}

// Token creation & verification
function generateToken(payload: { email: string; role: string }): string {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const data = JSON.stringify({ ...payload, exp: expiresAt });
  const hmac = crypto.createHmac('sha256', SERVER_SECRET).update(data).digest('hex');
  return Buffer.from(data).toString('base64url') + '.' + hmac;
}

function verifyToken(token: string): { email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedData, signature] = parts;
    const dataStr = Buffer.from(encodedData, 'base64url').toString('utf-8');
    const expectedHmac = crypto.createHmac('sha256', SERVER_SECRET).update(dataStr).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
      return null;
    }
    const payload = JSON.parse(dataStr);
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Middleware: Require Owner Authentication
function requireOwnerAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Owner token zaroori hai (Owner authorization required)' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'owner') {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired owner token' });
  }
  (req as any).user = payload;
  next();
}

// Optional Auth (to discern owner vs public)
function checkOptionalAuth(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  return payload?.role === 'owner';
}

async function startServer() {
  const app = express();

  // Parse JSON with generous limit for photo uploads
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // Static uploads directory
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Public system status
  app.get('/api/status', (req: Request, res: Response) => {
    const db = readDb();
    const publishedCount = db.memories.filter((m) => m.status === 'published').length;
    const draftCount = db.memories.filter((m) => m.status === 'draft').length;
    res.json({
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      totalMemories: db.memories.length,
      publishedCount,
      draftCount,
      ownerConfigured: true,
      isDefaultPassword: db.owner.isDefaultPassword,
      serverTime: new Date().toISOString(),
    });
  });

  // Owner Authentication Routes
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password zaroori hai' });
    }
    const db = readDb();
    const computedHash = hashPassword(password, db.owner.salt);

    if (computedHash !== db.owner.passwordHash) {
      return res.status(401).json({ error: 'Ghalat password. Barah-e-karam dobara koshish karein.' });
    }

    const token = generateToken({ email: db.owner.ownerEmail, role: 'owner' });
    res.json({
      token,
      ownerName: db.owner.ownerName,
      ownerEmail: db.owner.ownerEmail,
      isDefaultPassword: db.owner.isDefaultPassword,
      message: 'Khush Aamdeed! Owner login kamyab hua.',
    });
  });

  app.get('/api/auth/verify', requireOwnerAuth, (req: Request, res: Response) => {
    const db = readDb();
    res.json({
      valid: true,
      ownerName: db.owner.ownerName,
      ownerEmail: db.owner.ownerEmail,
      isDefaultPassword: db.owner.isDefaultPassword,
    });
  });

  app.post('/api/auth/update-credentials', requireOwnerAuth, (req: Request, res: Response) => {
    const { currentPassword, newPassword, ownerName, ownerEmail } = req.body;
    const db = readDb();

    if (currentPassword) {
      const computedHash = hashPassword(currentPassword, db.owner.salt);
      if (computedHash !== db.owner.passwordHash) {
        return res.status(401).json({ error: 'Purana password ghalat hai.' });
      }
    }

    if (newPassword && newPassword.length >= 6) {
      const newSalt = crypto.randomBytes(16).toString('hex');
      db.owner.passwordHash = hashPassword(newPassword, newSalt);
      db.owner.salt = newSalt;
      db.owner.isDefaultPassword = false;
    }

    if (ownerName) db.owner.ownerName = ownerName;
    if (ownerEmail) db.owner.ownerEmail = ownerEmail;

    writeDb(db);
    res.json({ success: true, message: 'Owner credentials kamyabi se update ho gaye.' });
  });

  // Public/Owner Settings
  app.get('/api/settings', (req: Request, res: Response) => {
    const db = readDb();
    // Exclude sensitive owner hashes
    res.json(db.settings);
  });

  app.put('/api/settings', requireOwnerAuth, (req: Request, res: Response) => {
    const db = readDb();
    db.settings = {
      ...db.settings,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    writeDb(db);
    res.json({ success: true, settings: db.settings });
  });

  // Categories CRUD
  app.get('/api/categories', (req: Request, res: Response) => {
    const db = readDb();
    res.json(db.categories);
  });

  app.post('/api/categories', requireOwnerAuth, (req: Request, res: Response) => {
    const { name, iconName } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Category name zaroori hai' });
    const db = readDb();
    const newCat = {
      id: 'cat-' + Date.now(),
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      iconName: iconName || 'Heart',
      orderIndex: db.categories.length + 1,
    };
    db.categories.push(newCat);
    writeDb(db);
    res.status(201).json(newCat);
  });

  app.put('/api/categories/:id', requireOwnerAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Category nahi mili' });
    db.categories[index] = { ...db.categories[index], ...req.body };
    writeDb(db);
    res.json(db.categories[index]);
  });

  app.delete('/api/categories/:id', requireOwnerAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    db.categories = db.categories.filter((c) => c.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  // Memories CRUD
  app.get('/api/memories', (req: Request, res: Response) => {
    const isOwner = checkOptionalAuth(req);
    const { category, search, sort, favorite } = req.query;
    const db = readDb();

    let items = isOwner ? [...db.memories] : db.memories.filter((m) => m.status === 'published');

    if (category && category !== 'all') {
      items = items.filter((m) => m.category.toLowerCase() === String(category).toLowerCase());
    }

    if (favorite === 'true') {
      items = items.filter((m) => m.isFavorite);
    }

    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.caption.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === 'oldest') {
      items.sort((a, b) => new Date(a.memoryDate).getTime() - new Date(b.memoryDate).getTime());
    } else if (sort === 'favorites') {
      items.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    } else {
      // Default: newest
      items.sort((a, b) => new Date(b.memoryDate).getTime() - new Date(a.memoryDate).getTime());
    }

    res.json(items);
  });

  app.get('/api/memories/:id', (req: Request, res: Response) => {
    const isOwner = checkOptionalAuth(req);
    const db = readDb();
    const memory = db.memories.find((m) => m.id === req.params.id);
    if (!memory) return res.status(404).json({ error: 'Tasveer nahi mili' });
    if (!isOwner && memory.status !== 'published') {
      return res.status(404).json({ error: 'Tasveer dastiyab nahi hai' });
    }
    res.json(memory);
  });

  app.post('/api/memories', requireOwnerAuth, (req: Request, res: Response) => {
    const {
      title,
      caption,
      alternativeCaptions,
      imageUrl,
      thumbnailUrl,
      category,
      tags,
      memoryDate,
      status,
      isFavorite,
      ownerNotes,
      visualDetailsObserved,
    } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Tasveer (Image URL) zaroori hai' });
    }

    const db = readDb();
    const newMemory = {
      id: 'mem-' + Date.now(),
      title: title?.trim() || 'Nanhi Si Yaad',
      caption: caption?.trim() || 'Hamare pyare baby ka ek anmol lamha.',
      alternativeCaptions: alternativeCaptions || [],
      imageUrl,
      thumbnailUrl: thumbnailUrl || imageUrl,
      category: category || 'Hamari Nanhi Jaan',
      tags: Array.isArray(tags) ? tags : [],
      memoryDate: memoryDate || new Date().toISOString().split('T')[0],
      uploadDate: new Date().toISOString(),
      status: status === 'draft' ? ('draft' as const) : ('published' as const),
      isFavorite: Boolean(isFavorite),
      orderIndex: db.memories.length + 1,
      ownerNotes: ownerNotes || '',
      visualDetailsObserved: visualDetailsObserved || '',
    };

    db.memories.unshift(newMemory);
    writeDb(db);
    res.status(201).json(newMemory);
  });

  app.put('/api/memories/:id', requireOwnerAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    const idx = db.memories.findIndex((m) => m.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Tasveer nahi mili' });

    db.memories[idx] = {
      ...db.memories[idx],
      ...req.body,
    };
    writeDb(db);
    res.json(db.memories[idx]);
  });

  app.delete('/api/memories/:id', requireOwnerAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    const mem = db.memories.find((m) => m.id === id);
    if (!mem) return res.status(404).json({ error: 'Tasveer nahi mili' });

    // If uploaded file, safely remove it from uploads if local
    if (mem.imageUrl && mem.imageUrl.startsWith('/uploads/')) {
      const filename = path.basename(mem.imageUrl);
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Failed to unlink file:', e);
        }
      }
    }

    db.memories = db.memories.filter((m) => m.id !== id);
    writeDb(db);
    res.json({ success: true, message: 'Tasveer kamyabi se delete ho gayi' });
  });

  app.post('/api/memories/:id/toggle-favorite', requireOwnerAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    const mem = db.memories.find((m) => m.id === id);
    if (!mem) return res.status(404).json({ error: 'Tasveer nahi mili' });

    mem.isFavorite = !mem.isFavorite;
    writeDb(db);
    res.json({ success: true, isFavorite: mem.isFavorite });
  });

  // Timeline CRUD
  app.get('/api/timeline', (req: Request, res: Response) => {
    const db = readDb();
    const sorted = [...db.timeline].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    res.json(sorted);
  });

  app.post('/api/timeline', requireOwnerAuth, (req: Request, res: Response) => {
    const { title, description, date, milestoneLabel, photoUrl } = req.body;
    if (!title || !description || !date) {
      return res.status(400).json({ error: 'Title, description aur date zaroori hain' });
    }
    const db = readDb();
    const newItem = {
      id: 'time-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      date,
      milestoneLabel: milestoneLabel?.trim() || '',
      photoUrl: photoUrl || '',
      orderIndex: db.timeline.length + 1,
    };
    db.timeline.push(newItem);
    writeDb(db);
    res.status(201).json(newItem);
  });

  app.put('/api/timeline/:id', requireOwnerAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    const idx = db.timeline.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Timeline entry nahi mili' });
    db.timeline[idx] = { ...db.timeline[idx], ...req.body };
    writeDb(db);
    res.json(db.timeline[idx]);
  });

  app.delete('/api/timeline/:id', requireOwnerAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    db.timeline = db.timeline.filter((t) => t.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  // Blessings CRUD
  app.get('/api/blessings', (req: Request, res: Response) => {
    const db = readDb();
    res.json(db.blessings);
  });

  app.post('/api/blessings', requireOwnerAuth, (req: Request, res: Response) => {
    const { text, author, translationOrNote } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Dua ka matan zaroori hai' });
    const db = readDb();
    const newItem = {
      id: 'bless-' + Date.now(),
      text: text.trim(),
      author: author?.trim() || 'Walidain Ki Dua',
      translationOrNote: translationOrNote?.trim() || '',
      orderIndex: db.blessings.length + 1,
    };
    db.blessings.push(newItem);
    writeDb(db);
    res.status(201).json(newItem);
  });

  app.put('/api/blessings/:id', requireOwnerAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    const idx = db.blessings.findIndex((b) => b.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Dua nahi mili' });
    db.blessings[idx] = { ...db.blessings[idx], ...req.body };
    writeDb(db);
    res.json(db.blessings[idx]);
  });

  app.delete('/api/blessings/:id', requireOwnerAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const db = readDb();
    db.blessings = db.blessings.filter((b) => b.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  // Secure Photo Upload Endpoint (Owner Only)
  app.post('/api/upload', requireOwnerAuth, (req: Request, res: Response) => {
    try {
      const { dataUrl, filename: originalName } = req.body;
      if (!dataUrl || typeof dataUrl !== 'string') {
        return res.status(400).json({ error: 'Image data URL zaroori hai' });
      }

      // Format: data:image/png;base64,iVBORw0KGgo...
      const match = dataUrl.match(/^data:(image\/(jpeg|png|webp|gif));base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ error: 'Ghair tasdeeq shuda format. Sirf JPEG, PNG ya WebP tasveerein qabil-e-qubool hain.' });
      }

      const mimeType = match[1];
      const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1];
      const base64Data = match[3];
      const buffer = Buffer.from(base64Data, 'base64');

      // Max size check: 15MB
      if (buffer.length > 15 * 1024 * 1024) {
        return res.status(400).json({ error: 'Tasveer ka size 15MB se kam hona chahiye.' });
      }

      const randomHash = crypto.randomBytes(16).toString('hex');
      const safeFilename = `baby-${Date.now()}-${randomHash}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, safeFilename);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${safeFilename}`;
      res.json({
        url: publicUrl,
        filename: safeFilename,
        size: buffer.length,
        mimeType,
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Tasveer save karne mein masla hua: ' + (err.message || 'Server error') });
    }
  });

  // Configurable Free-Tier Vision Models
  const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-flash-lite-latest';

  // Helper function for resilient vision generation with backoff retries & model fallback
  async function generateVisionCaptionWithRetry(
    aiClient: GoogleGenAI,
    imagePart: { inlineData: { data: string; mimeType: string } },
    promptText: string
  ): Promise<{ text: string; modelUsed: string }> {
    const models = [
      PRIMARY_MODEL,
      ...(FALLBACK_MODEL && FALLBACK_MODEL !== PRIMARY_MODEL ? [FALLBACK_MODEL] : []),
    ];

    const isTransientError = (err: any): boolean => {
      const status = err?.status || err?.statusCode || err?.error?.code;
      const msg = String(err?.message || '').toLowerCase();
      if (status === 503 || status === 429 || status === 500 || status === 502 || status === 504) return true;
      if (
        msg.includes('503') ||
        msg.includes('429') ||
        msg.includes('unavailable') ||
        msg.includes('high demand') ||
        msg.includes('resource_exhausted') ||
        msg.includes('rate limit') ||
        msg.includes('fetch failed') ||
        msg.includes('econnreset') ||
        msg.includes('timeout')
      ) {
        return true;
      }
      return false;
    };

    const getRetryDelay = (err: any, attempt: number): number => {
      const retryAfterMatch = String(err?.message || '').match(/retry[- ]after[:= ]*(\d+)/i);
      if (retryAfterMatch && retryAfterMatch[1]) {
        const sec = parseInt(retryAfterMatch[1], 10);
        if (!isNaN(sec) && sec > 0 && sec <= 10) return sec * 1000;
      }
      const base = 800;
      const exp = Math.min(base * Math.pow(2, attempt), 4000);
      const jitter = Math.floor(Math.random() * 400);
      return exp + jitter;
    };

    let lastError: any = null;

    for (const model of models) {
      const maxAttempts = 3;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          console.log(`[Gemini Caption] Trying model ${model} (attempt ${attempt + 1}/${maxAttempts})...`);
          const response = await aiClient.models.generateContent({
            model,
            contents: {
              parts: [imagePart, { text: promptText }],
            },
            config: {
              responseMimeType: 'application/json',
            },
          });

          const text = response.text;
          if (text && text.trim()) {
            console.log(`[Gemini Caption] Successfully generated with model ${model}`);
            return { text, modelUsed: model };
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini Caption] Failure on model ${model} (attempt ${attempt + 1}/${maxAttempts}):`, err?.status || err?.message);

          if (!isTransientError(err)) {
            break;
          }

          if (attempt < maxAttempts - 1) {
            const delay = getRetryDelay(err, attempt);
            console.log(`[Gemini Caption] Backoff waiting ${delay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    }

    throw lastError;
  }

  // AI Roman Urdu Caption Generator (Owner Only)
  app.post('/api/ai/generate-caption', requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const { imageData, mimeType = 'image/jpeg', categoryHint, babyName = 'Baby' } = req.body;

      if (!imageData) {
        return res.status(400).json({ error: 'Tasveer ka data zaroori hai (Image data required)' });
      }

      if (!ai) {
        return res.status(503).json({
          error: 'Gemini API Key server par configure nahi hai. Aap apna Roman Urdu caption neeche khud asani se darj kar sakte hain.',
          isAiUnavailable: true,
        });
      }

      // Clean base64 string
      const rawBase64 = imageData.replace(/^data:image\/[a-z0-9+.-]+;base64,/, '');

      const prompt = `You are a creative Roman Urdu writer for a beautiful newborn baby memory website.

Carefully examine the supplied photograph and write a unique, heartfelt Roman Urdu title and caption that match the visible scene.

Write natural Roman Urdu using English letters, not Urdu script.

Mention one or two relevant visible details, such as the baby's clothing, blanket, toys, expression, or background, when appropriate.

Make the caption emotional, gentle, beautiful, and suitable for a family memory album.

Avoid generic repetitive sentences. Do not use the same wording for every photograph.

Return valid JSON containing title, caption, cuteAlternative, poeticAlternative, duaAlternative, tags, and category.

Never invent information that cannot be seen in the image or supplied by the owner.`;

      const imagePart = {
        inlineData: {
          data: rawBase64,
          mimeType: mimeType || 'image/jpeg',
        },
      };

      const { text, modelUsed } = await generateVisionCaptionWithRetry(ai, imagePart, prompt);

      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        const cleaned = text.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
        parsed = JSON.parse(cleaned);
      }

      const alternatives: Array<{ style: string; text: string }> = [];
      if (parsed.cuteAlternative) {
        alternatives.push({ style: 'Cute & Playful', text: String(parsed.cuteAlternative).trim() });
      }
      if (parsed.poeticAlternative) {
        alternatives.push({ style: 'Poetic', text: String(parsed.poeticAlternative).trim() });
      }
      if (parsed.duaAlternative) {
        alternatives.push({ style: 'Dua', text: String(parsed.duaAlternative).trim() });
      }
      if (Array.isArray(parsed.alternativeCaptions)) {
        for (const alt of parsed.alternativeCaptions) {
          if (alt?.text && !alternatives.some((a) => a.text === alt.text)) {
            alternatives.push({ style: alt.style || 'Alternative', text: String(alt.text).trim() });
          }
        }
      }

      const tagsArray = Array.isArray(parsed.tags)
        ? parsed.tags.map((t: any) => String(t).trim()).filter(Boolean)
        : typeof parsed.tags === 'string'
        ? parsed.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : ['baby-memories', 'roman-urdu'];

      res.json({
        title: parsed.title ? String(parsed.title).trim() : 'Nanhi Si Yaad',
        caption: parsed.caption ? String(parsed.caption).trim() : '',
        cuteAlternative: parsed.cuteAlternative || '',
        poeticAlternative: parsed.poeticAlternative || '',
        duaAlternative: parsed.duaAlternative || '',
        alternativeCaptions: alternatives,
        suggestedCategory: parsed.category ? String(parsed.category).trim() : (categoryHint || 'Hamari Nanhi Jaan'),
        suggestedTags: tagsArray,
        visualDetailsObserved: parsed.visualDetailsObserved || '',
        modelUsed,
      });
    } catch (err: any) {
      console.error('All Gemini vision models failed after retries:', err?.message || err);
      // Return clear Roman Urdu manual fallback notification without pretending AI succeeded
      res.status(503).json({
        error: 'AI caption service is waqt masroof (high demand) hai. Barah-e-karam apna Roman Urdu caption neeche khud darj karein aur tasveer save karein.',
        isAiUnavailable: true,
      });
    }
  });

  // Metadata Backup Export & Import (Owner Only)
  app.get('/api/backup/export', requireOwnerAuth, (req: Request, res: Response) => {
    const db = readDb();
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: db.settings,
      categories: db.categories,
      memories: db.memories,
      timeline: db.timeline,
      blessings: db.blessings,
    };
    res.setHeader('Content-Disposition', `attachment; filename="baby-memories-backup-${Date.now()}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(backupData, null, 2));
  });

  app.post('/api/backup/import', requireOwnerAuth, (req: Request, res: Response) => {
    const { backup } = req.body;
    if (!backup || !backup.memories || !backup.settings) {
      return res.status(400).json({ error: 'Ghalat backup file format' });
    }
    const db = readDb();
    if (backup.settings) db.settings = { ...db.settings, ...backup.settings };
    if (Array.isArray(backup.categories)) db.categories = backup.categories;
    if (Array.isArray(backup.memories)) db.memories = backup.memories;
    if (Array.isArray(backup.timeline)) db.timeline = backup.timeline;
    if (Array.isArray(backup.blessings)) db.blessings = backup.blessings;

    writeDb(db);
    res.json({ success: true, message: 'Backup kamyabi se restore ho gaya!' });
  });

  // Mount Vite or static server
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Baby Memories Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
