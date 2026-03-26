const express = require('express');
const multer = require('multer');
const Card = require('../models/Card');
const { authenticateToken } = require('../middleware/auth');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const router = express.Router();

// Initialize DOMPurify
const window = new JSDOM('').window;
const DOMPurifyInstance = DOMPurify(window);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Sanitize input
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return DOMPurifyInstance.sanitize(input, { ALLOWED_TAGS: [] });
  }
  return input;
}

// Create card
router.post('/', authenticateToken, upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'laudoFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const cardData = req.body;
    cardData.user_id = req.userId;

    // Sanitize text inputs
    const textFields = ['nome', 'endereco', 'cidade', 'numero_laudo', 'nome_medico', 'crm_medico'];
    textFields.forEach(field => {
      if (cardData[field]) {
        cardData[field] = sanitizeInput(cardData[field]);
      }
    });

    // Handle file uploads
    if (req.files.foto) {
      cardData.foto = req.files.foto[0].buffer;
    }
    if (req.files.laudoFile) {
      cardData.laudo_file = req.files.laudoFile[0].buffer;
    }

    // Generate card number and verification code
    cardData.numero_carteira = generateCardNumber();
    cardData.validade = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    cardData.codigo_verificacao = generateVerifyCode(cardData.cpf, cardData.numero_carteira);

    const card = await Card.create(cardData);

    // Add emergency contacts if provided
    if (cardData.emergencyContacts) {
      const contacts = JSON.parse(cardData.emergencyContacts);
      for (const contact of contacts) {
        await Card.addEmergencyContact(card.id, contact);
      }
    }

    res.status(201).json({ card });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Get user's card
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const card = await Card.findByUserId(req.userId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Get emergency contacts
    const emergencyContacts = await Card.getEmergencyContacts(card.id);

    res.json({ ...card, emergencyContacts });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Failed to get card' });
  }
});

// Verify card by code
router.get('/verify/:code', async (req, res) => {
  try {
    const card = await Card.findByVerificationCode(req.params.code);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Get emergency contacts
    const emergencyContacts = await Card.getEmergencyContacts(card.id);

    res.json({ ...card, emergencyContacts });
  } catch (error) {
    console.error('Verify card error:', error);
    res.status(500).json({ error: 'Failed to verify card' });
  }
});

// Update card
router.put('/:id', authenticateToken, upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'laudoFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const cardId = req.params.id;
    const updateData = req.body;

    // Check if card belongs to user
    const card = await Card.findByUserId(req.userId);
    if (!card || card.id != cardId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Handle file uploads
    if (req.files.foto) {
      updateData.foto = req.files.foto[0].buffer;
    }
    if (req.files.laudoFile) {
      updateData.laudo_file = req.files.laudoFile[0].buffer;
    }

    await Card.update(cardId, updateData);
    res.json({ message: 'Card updated successfully' });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

function generateCardNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GC${timestamp}${random}`;
}

function generateVerifyCode(cpf, numero) {
  const raw = (cpf || '') + (numero || '') + 'GOCARD2025';
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return 'VER-' + Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
}

module.exports = router;