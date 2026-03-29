-- Trello Clone Database Schema
-- PostgreSQL

-- Users
CREATE TABLE IF NOT EXISTS users (
  id        SERIAL PRIMARY KEY,
  username  VARCHAR(50)  NOT NULL UNIQUE,
  email     VARCHAR(255) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,
  avatar    VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Boards
CREATE TABLE IF NOT EXISTS boards (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  background_color VARCHAR(50)  NOT NULL DEFAULT '#0052cc',
  owner_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Lists
CREATE TABLE IF NOT EXISTS lists (
  id         SERIAL PRIMARY KEY,
  board_id   INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Cards
CREATE TABLE IF NOT EXISTS cards (
  id          SERIAL PRIMARY KEY,
  list_id     INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  due_date    TIMESTAMPTZ,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Labels
CREATE TABLE IF NOT EXISTS labels (
  id         SERIAL PRIMARY KEY,
  board_id   INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  color      VARCHAR(50)  NOT NULL DEFAULT '#61bd4f',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Card Labels (many-to-many)
CREATE TABLE IF NOT EXISTS card_labels (
  card_id  INTEGER NOT NULL REFERENCES cards(id)  ON DELETE CASCADE,
  label_id INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);

-- Card Members (many-to-many)
CREATE TABLE IF NOT EXISTS card_members (
  card_id  INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, user_id)
);

-- Checklists
CREATE TABLE IF NOT EXISTS checklists (
  id         SERIAL PRIMARY KEY,
  card_id    INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL DEFAULT 'Checklist',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Checklist Items
CREATE TABLE IF NOT EXISTS checklist_items (
  id           SERIAL PRIMARY KEY,
  checklist_id INTEGER NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  content      TEXT    NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  position     INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performances
CREATE INDEX IF NOT EXISTS idx_lists_board_id   ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_lists_position   ON lists(board_id, position);
CREATE INDEX IF NOT EXISTS idx_cards_list_id    ON cards(list_id);
CREATE INDEX IF NOT EXISTS idx_cards_position   ON cards(list_id, position);
CREATE INDEX IF NOT EXISTS idx_cards_due_date   ON cards(due_date);
CREATE INDEX IF NOT EXISTS idx_labels_board_id  ON labels(board_id);
CREATE INDEX IF NOT EXISTS idx_checklists_card  ON checklists(card_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items  ON checklist_items(checklist_id);
