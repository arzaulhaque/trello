const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

router.get('/search', cardController.searchCards);
router.post('/', cardController.createCard);
router.get('/:id', cardController.getCard);
router.put('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);
router.patch('/move', cardController.moveCard);
router.patch('/reorder', cardController.reorderCards);
router.post('/:id/labels', cardController.addLabel);
router.delete('/:id/labels/:labelId', cardController.removeLabel);
router.post('/:id/members', cardController.addMember);
router.delete('/:id/members/:userId', cardController.removeMember);
router.post('/:id/checklists', cardController.addChecklist);
router.post('/:id/checklists/:checklistId/items', cardController.addChecklistItem);
router.patch('/:id/checklists/:checklistId/items/:itemId', cardController.updateChecklistItem);
router.patch('/:id/due-date', cardController.updateDueDate);

module.exports = router;
