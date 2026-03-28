-- Trello Clone Seed Data
-- Run schema.sql first

-- Users
INSERT INTO users (username, email, password) VALUES
  ('alice',   'alice@example.com',   '$2b$10$hashedpassword1'),
  ('bob',     'bob@example.com',     '$2b$10$hashedpassword2'),
  ('charlie', 'charlie@example.com', '$2b$10$hashedpassword3');

-- Board
INSERT INTO boards (title, background_color, owner_id) VALUES
  ('My First Project', '#0052cc', 1);

-- Lists
INSERT INTO lists (board_id, title, position) VALUES
  (1, 'To Do',       0),
  (1, 'In Progress', 1),
  (1, 'Done',        2);

-- Labels
INSERT INTO labels (board_id, name, color) VALUES
  (1, 'Bug',      '#eb5a46'),
  (1, 'Feature',  '#61bd4f'),
  (1, 'Urgent',   '#f2d600'),
  (1, 'Design',   '#c377e0'),
  (1, 'Backend',  '#0079bf');

-- Cards – To Do (list 1)
INSERT INTO cards (list_id, title, description, position) VALUES
  (1, 'Set up project structure',  'Initialize repo and folder layout', 0),
  (1, 'Design database schema',    'ERD and SQL table definitions',      1),
  (1, 'Write API documentation',   NULL,                                  2);

-- Cards – In Progress (list 2)
INSERT INTO cards (list_id, title, description, due_date, position) VALUES
  (2, 'Implement authentication',  'JWT login/register endpoints', NOW() + INTERVAL '3 days', 0),
  (2, 'Build board UI',            'React board page with drag & drop',  NOW() + INTERVAL '5 days', 1);

-- Cards – Done (list 3)
INSERT INTO cards (list_id, title, description, position) VALUES
  (3, 'Project kickoff meeting',   'Agreed on tech stack and timeline', 0),
  (3, 'Set up CI/CD pipeline',     'GitHub Actions workflow',           1),
  (3, 'Configure ESLint & Prettier', NULL,                               2);

-- Card Labels
INSERT INTO card_labels (card_id, label_id) VALUES
  (1, 2),  -- "Set up project structure" → Feature
  (2, 5),  -- "Design database schema"   → Backend
  (4, 1),  -- "Implement authentication" → Bug
  (4, 3),  -- "Implement authentication" → Urgent
  (5, 2),  -- "Build board UI"           → Feature
  (5, 4);  -- "Build board UI"           → Design

-- Card Members
INSERT INTO card_members (card_id, user_id) VALUES
  (1, 1),
  (2, 2),
  (4, 1),
  (4, 3),
  (5, 2),
  (6, 1);

-- Checklists
INSERT INTO checklists (card_id, title) VALUES
  (4, 'Auth Tasks'),
  (5, 'UI Checklist');

-- Checklist Items – Auth Tasks (checklist 1)
INSERT INTO checklist_items (checklist_id, content, is_completed, position) VALUES
  (1, 'Create user table',          TRUE,  0),
  (1, 'Hash passwords with bcrypt', TRUE,  1),
  (1, 'Generate JWT tokens',        FALSE, 2),
  (1, 'Protect private routes',     FALSE, 3);

-- Checklist Items – UI Checklist (checklist 2)
INSERT INTO checklist_items (checklist_id, content, is_completed, position) VALUES
  (2, 'Create Board component',    TRUE,  0),
  (2, 'Create List component',     TRUE,  1),
  (2, 'Create Card component',     FALSE, 2),
  (2, 'Add drag and drop support', FALSE, 3);
