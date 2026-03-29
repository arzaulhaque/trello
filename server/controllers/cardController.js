const cardService = require('../services/cardService');

async function createCard(req, res, next) {
  try {
    const { list_id, title, description, due_date } = req.body;
    if (!list_id || !title) {
      return res.status(400).json({ error: { message: 'list_id and title are required', status: 400 } });
    }
    const card = await cardService.createCard(list_id, title, description, due_date);
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
}

async function getCard(req, res, next) {
  try {
    const card = await cardService.getCardById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: { message: 'Card not found', status: 404 } });
    }
    res.json(card);
  } catch (err) {
    next(err);
  }
}

async function updateCard(req, res, next) {
  try {
    const card = await cardService.updateCard(req.params.id, req.body);
    if (!card) {
      return res.status(404).json({ error: { message: 'Card not found', status: 404 } });
    }
    res.json(card);
  } catch (err) {
    next(err);
  }
}

async function deleteCard(req, res, next) {
  try {
    const card = await cardService.deleteCard(req.params.id);
    if (!card) {
      return res.status(404).json({ error: { message: 'Card not found', status: 404 } });
    }
    res.json({ message: 'Card deleted', card });
  } catch (err) {
    next(err);
  }
}

async function moveCard(req, res, next) {
  try {
    const { card_id, target_list_id, position } = req.body;
    if (!card_id || !target_list_id || position === undefined) {
      return res.status(400).json({ error: { message: 'card_id, target_list_id, and position are required', status: 400 } });
    }
    const card = await cardService.moveCard(card_id, target_list_id, position);
    res.json(card);
  } catch (err) {
    next(err);
  }
}

async function reorderCards(req, res, next) {
  try {
    const { list_id, ordered_ids } = req.body;
    if (!list_id || !Array.isArray(ordered_ids)) {
      return res.status(400).json({ error: { message: 'list_id and ordered_ids are required', status: 400 } });
    }
    const cards = await cardService.reorderCards(list_id, ordered_ids);
    res.json(cards);
  } catch (err) {
    next(err);
  }
}

async function addLabel(req, res, next) {
  try {
    const { label_id } = req.body;
    if (!label_id) {
      return res.status(400).json({ error: { message: 'label_id is required', status: 400 } });
    }
    await cardService.addLabel(req.params.id, label_id);
    res.json({ message: 'Label added' });
  } catch (err) {
    next(err);
  }
}

async function removeLabel(req, res, next) {
  try {
    await cardService.removeLabel(req.params.id, req.params.labelId);
    res.json({ message: 'Label removed' });
  } catch (err) {
    next(err);
  }
}

async function addMember(req, res, next) {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: { message: 'user_id is required', status: 400 } });
    }
    await cardService.addMember(req.params.id, user_id);
    res.json({ message: 'Member added' });
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    await cardService.removeMember(req.params.id, req.params.userId);
    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
}

async function addChecklist(req, res, next) {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: { message: 'title is required', status: 400 } });
    }
    const checklist = await cardService.addChecklist(req.params.id, title);
    res.status(201).json(checklist);
  } catch (err) {
    next(err);
  }
}

async function addChecklistItem(req, res, next) {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: { message: 'content is required', status: 400 } });
    }
    const item = await cardService.addChecklistItem(req.params.checklistId, content);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function updateChecklistItem(req, res, next) {
  try {
    const item = await cardService.updateChecklistItem(req.params.itemId, req.body);
    if (!item) {
      return res.status(404).json({ error: { message: 'Checklist item not found', status: 404 } });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function updateDueDate(req, res, next) {
  try {
    const { due_date } = req.body;
    const card = await cardService.updateCard(req.params.id, { due_date });
    if (!card) {
      return res.status(404).json({ error: { message: 'Card not found', status: 404 } });
    }
    res.json(card);
  } catch (err) {
    next(err);
  }
}

async function searchCards(req, res, next) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: { message: 'query parameter is required', status: 400 } });
    }
    const cards = await cardService.searchCards(query);
    res.json(cards);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createCard, getCard, updateCard, deleteCard,
  moveCard, reorderCards,
  addLabel, removeLabel,
  addMember, removeMember,
  addChecklist, addChecklistItem, updateChecklistItem,
  updateDueDate, searchCards,
};
