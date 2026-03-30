# 🗂 Trello Clone

A full-stack project management app inspired by Trello, built with React (Vite), Node.js/Express, and PostgreSQL.

---

## 🚀 Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Vite, Axios, @hello-pangea/dnd        |
| Backend   | Node.js, Express, MVC architecture              |
| Database  | PostgreSQL                                      |
| Testing   | Jest, Supertest                                 |

---

## ✨ Features

- **Boards** – Create and manage project boards with custom background colours
- **Lists** – Organize work into To Do / In Progress / Done columns
- **Cards** – Create cards with title, description, due date, labels, and members
- **Drag & Drop** – Reorder lists horizontally and cards within / across lists using `@hello-pangea/dnd`
- **Card Details Modal** – Edit title, description, labels, members, checklists, and due date
- **Checklists** – Add checklist items with progress bar and toggle completion
- **Search & Filter** – Debounced search by title; filter by label, member, or due date
- **Responsive UI** – Mobile-first layout that adapts from phone to desktop
- **Users** – Retrieve user list to assign members to cards
- **REST API** – Full CRUD for boards, lists, cards, labels, members, checklists, and users

---

## 📁 Folder Structure

```
root/
  client/               # React (Vite) frontend
    src/
      components/       # Board, List, Card, CardModal, SearchFilter
      pages/            # BoardPage
      services/         # API client (axios wrapper)
      hooks/            # useDebounce
      utils/            # helpers (formatDate, isOverdue, generateId)
  server/               # Node.js / Express backend
    controllers/        # boardController, listController, cardController, userController
    routes/             # boardRoutes, listRoutes, cardRoutes, userRoutes
    services/           # boardService, listService, cardService, userService
    config/             # db.js (pg Pool)
    middlewares/        # errorHandler
    __tests__/          # Jest + Supertest tests (health, api, db)
  database/
    schema.sql          # CREATE TABLE statements
    seed.sql            # Sample data
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 14

### 1. Clone & install dependencies

```bash
git clone https://github.com/arzaulhaque/trello.git
cd trello
npm run install:all
```

### 2. Database setup

```bash
psql -U postgres -c "CREATE DATABASE trello_db;"
psql -U postgres -d trello_db -f database/schema.sql
psql -U postgres -d trello_db -f database/seed.sql
```

### 3. Configure environment variables

```bash
# server/.env
cp server/.env.example server/.env
# Edit DATABASE_URL, PORT as needed

# client/.env
cp client/.env.example client/.env
# Edit VITE_API_BASE_URL if your server runs on a different port
```

### 4. Run locally

```bash
# Start both server and client concurrently
npm run dev

# Or individually:
npm run server   # Express on http://localhost:5000
npm run client   # React on http://localhost:3000
```

### 5. Run tests

```bash
npm test   # runs Jest + Supertest in server/
```

---

## 🗄️ Database Schema

| Table             | Description                                     |
|-------------------|-------------------------------------------------|
| `users`           | User accounts (username, email, password hash)  |
| `boards`          | Project boards with background colour           |
| `lists`           | Ordered columns within a board                  |
| `cards`           | Tasks within a list (title, description, due)   |
| `labels`          | Colour-coded labels scoped to a board           |
| `card_labels`     | Many-to-many: cards ↔ labels                    |
| `card_members`    | Many-to-many: cards ↔ users                     |
| `checklists`      | Named checklists attached to cards              |
| `checklist_items` | Individual items within a checklist             |

Foreign keys cascade on delete so removing a board removes all its lists, cards, etc.

---

## 🔌 API Endpoints

### Boards
| Method | Path                      | Description                  |
|--------|---------------------------|------------------------------|
| GET    | /api/boards               | List all boards              |
| POST   | /api/boards               | Create a board               |
| GET    | /api/boards/:id           | Get board with lists/cards   |
| PUT    | /api/boards/:id           | Update board                 |
| DELETE | /api/boards/:id           | Delete board                 |
| GET    | /api/boards/:id/labels    | Get labels for a board       |
| POST   | /api/boards/:id/labels    | Create a label on a board    |

### Lists
| Method | Path              | Description    |
|--------|-------------------|----------------|
| POST   | /api/lists        | Create list    |
| PUT    | /api/lists/:id    | Update list    |
| DELETE | /api/lists/:id    | Delete list    |
| PATCH  | /api/lists/reorder| Reorder lists  |

### Cards
| Method | Path                                                   | Description           |
|--------|--------------------------------------------------------|-----------------------|
| POST   | /api/cards                                             | Create card           |
| GET    | /api/cards/:id                                         | Get card details      |
| PUT    | /api/cards/:id                                         | Update card           |
| DELETE | /api/cards/:id                                         | Delete card           |
| PATCH  | /api/cards/move                                        | Move card to list     |
| PATCH  | /api/cards/reorder                                     | Reorder cards in list |
| POST   | /api/cards/:id/labels                                  | Add label             |
| DELETE | /api/cards/:id/labels/:labelId                         | Remove label          |
| POST   | /api/cards/:id/members                                 | Assign member         |
| DELETE | /api/cards/:id/members/:userId                         | Remove member         |
| POST   | /api/cards/:id/checklists                              | Add checklist         |
| POST   | /api/cards/:id/checklists/:checklistId/items           | Add checklist item    |
| PATCH  | /api/cards/:id/checklists/:checklistId/items/:itemId   | Toggle item           |
| PATCH  | /api/cards/:id/due-date                                | Update due date       |
| GET    | /api/cards/search?query=                               | Search cards by title |

### Users
| Method | Path        | Description         |
|--------|-------------|---------------------|
| GET    | /api/users  | List all users      |

---

## 🚀 Deployment

### Backend – Render / Railway

1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set **Root Directory** to `server`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add environment variable `DATABASE_URL` pointing to your hosted PostgreSQL
7. Add `NODE_ENV=production`

### Frontend – Vercel

1. Import the repository on [Vercel](https://vercel.com)
2. Set **Root Directory** to `client`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add environment variable `VITE_API_BASE_URL=https://your-render-api.onrender.com/api`

---

## 📸 Screenshots

> _Add screenshots of the board, card modal, search filter, and mobile layout here._

---

## 👤 Author

Built as a full-stack SDE intern project demonstrating:
- React hooks & component architecture
- Express MVC with service layer
- PostgreSQL with relational schema design
- Drag-and-drop UX
- REST API design
