const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');

router.get('/', boardController.getBoards);
router.post('/', boardController.createBoard);
router.get('/:id/labels', boardController.getBoardLabels);
router.post('/:id/labels', boardController.createBoardLabel);
router.get('/:id', boardController.getBoard);
router.put('/:id', boardController.updateBoard);
router.delete('/:id', boardController.deleteBoard);

module.exports = router;
