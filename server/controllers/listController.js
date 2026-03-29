const listService = require('../services/listService');

async function createList(req, res, next) {
  try {
    const { board_id, title } = req.body;
    if (!board_id || !title) {
      return res.status(400).json({ error: { message: 'board_id and title are required', status: 400 } });
    }
    const list = await listService.createList(board_id, title);
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
}

async function updateList(req, res, next) {
  try {
    const list = await listService.updateList(req.params.id, req.body);
    if (!list) {
      return res.status(404).json({ error: { message: 'List not found', status: 404 } });
    }
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function deleteList(req, res, next) {
  try {
    const list = await listService.deleteList(req.params.id);
    if (!list) {
      return res.status(404).json({ error: { message: 'List not found', status: 404 } });
    }
    res.json({ message: 'List deleted', list });
  } catch (err) {
    next(err);
  }
}

async function reorderLists(req, res, next) {
  try {
    const { board_id, ordered_ids } = req.body;
    if (!board_id || !Array.isArray(ordered_ids)) {
      return res.status(400).json({ error: { message: 'board_id and ordered_ids are required', status: 400 } });
    }
    const lists = await listService.reorderLists(board_id, ordered_ids);
    res.json(lists);
  } catch (err) {
    next(err);
  }
}

module.exports = { createList, updateList, deleteList, reorderLists };
