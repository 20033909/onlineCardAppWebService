const express = require('express');
const { body, validationResult } = require('express-validator');
const Card = require('../models/Card');
const { authenticateToken } = require('../middleware/auth');
const { cardLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// All card routes require authentication and rate limiting
router.use(cardLimiter);
router.use(authenticateToken);

// Validation middleware
const validateCard = [
  body('cardNumber').isLength({ min: 13, max: 19 }).withMessage('Card number must be 13-19 digits'),
  body('cardHolderName').trim().notEmpty().withMessage('Card holder name is required'),
  body('expiryDate').matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage('Expiry date must be in MM/YY format'),
  body('cvv').isLength({ min: 3, max: 4 }).withMessage('CVV must be 3-4 digits'),
  body('cardType').isIn(['Visa', 'MasterCard', 'American Express', 'Discover']).withMessage('Invalid card type')
];

// Create a new card
router.post('/', validateCard, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { cardNumber, cardHolderName, expiryDate, cvv, cardType, balance } = req.body;

    // Check if card already exists
    const existingCard = await Card.findByCardNumber(cardNumber);
    if (existingCard) {
      return res.status(409).json({ error: 'Card number already exists' });
    }

    const card = await Card.create(req.user.id, {
      cardNumber,
      cardHolderName,
      expiryDate,
      cvv,
      cardType,
      balance
    });

    // Don't return CVV in response for security
    const { cvv: _, ...cardWithoutCvv } = card;
    res.status(201).json({
      message: 'Card created successfully',
      card: cardWithoutCvv
    });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Get all cards for the authenticated user
router.get('/', async (req, res) => {
  try {
    const cards = await Card.findByUserId(req.user.id);
    // Remove CVV from response for security
    const cardsWithoutCvv = cards.map(({ cvv, ...card }) => card);
    res.json({ cards: cardsWithoutCvv });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Failed to get cards' });
  }
});

// Get a specific card by ID
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if card belongs to the authenticated user
    if (card.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove CVV from response
    const { cvv, ...cardWithoutCvv } = card;
    res.json({ card: cardWithoutCvv });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Failed to get card' });
  }
});

// Update a card
router.put('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if card belongs to the authenticated user
    if (card.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { cardHolderName, expiryDate, isActive } = req.body;
    await Card.update(req.params.id, { cardHolderName, expiryDate, isActive });

    const updatedCard = await Card.findById(req.params.id);
    const { cvv, ...cardWithoutCvv } = updatedCard;

    res.json({
      message: 'Card updated successfully',
      card: cardWithoutCvv
    });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Update card balance
router.patch('/:id/balance', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if card belongs to the authenticated user
    if (card.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { balance } = req.body;
    if (balance === undefined || balance < 0) {
      return res.status(400).json({ error: 'Valid balance is required' });
    }

    await Card.updateBalance(req.params.id, balance);

    res.json({
      message: 'Card balance updated successfully',
      balance
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ error: 'Failed to update card balance' });
  }
});

// Delete a card
router.delete('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if card belongs to the authenticated user
    if (card.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Card.delete(req.params.id);

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

module.exports = router;
