const boardService = require('../services/boardService');

async function getBoards(req, res, next) {
  try {
    const boards = await boardService.getAllBoards();
    res.json(boards);
  } catch (err) {
    next(err);
  }
}

async function getBoard(req, res, next) {
  try {
    const board = await boardService.getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: { message: 'Board not found', status: 404 } });
    }
    res.json(board);
  } catch (err) {
    next(err);
  }
}

async function createBoard(req, res, next) {
  try {
    const { title, background_color, owner_id } = req.body;
    if (!title) {
      return res.status(400).json({ error: { message: 'Title is required', status: 400 } });
    }
    const board = await boardService.createBoard(title, background_color, owner_id);
    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
}

async function updateBoard(req, res, next) {
  try {
    const board = await boardService.updateBoard(req.params.id, req.body);
    if (!board) {
      return res.status(404).json({ error: { message: 'Board not found', status: 404 } });
    }
    res.json(board);
  } catch (err) {
    next(err);
  }
}

async function deleteBoard(req, res, next) {
  try {
    const board = await boardService.deleteBoard(req.params.id);
    if (!board) {
      return res.status(404).json({ error: { message: 'Board not found', status: 404 } });
    }
    res.json({ message: 'Board deleted', board });
  } catch (err) {
    next(err);
  }
}

async function getBoardLabels(req, res, next) {
  try {
    const labels = await boardService.getBoardLabels(req.params.id);
    res.json(labels);
  } catch (err) {
    next(err);
  }
}

async function createBoardLabel(req, res, next) {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: { message: 'name is required', status: 400 } });
    }
    const label = await boardService.createBoardLabel(req.params.id, name, color);
    res.status(201).json(label);
  } catch (err) {
    next(err);
  }
}

module.exports = { getBoards, getBoard, createBoard, updateBoard, deleteBoard, getBoardLabels, createBoardLabel };
