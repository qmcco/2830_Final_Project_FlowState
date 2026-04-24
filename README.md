# FlowState MERN Project

FlowState is a collaborative task and project management web application that allows teams to create projects, organize members, assign tasks, set deadlines, and visualize project timelines. It combines team-based access control with task tracking to reduce scattered communication, unclear task ownership, and missed deadlines.

## Prerequisites

- Node.js 20+
- npm
- MongoDB

## Environment Setup

1. Open the server folder.
2. Create a file named .env.
3. Copy values from .env.example and fill in your MongoDB connection URI.

Example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?appName=FlowState
MONGO_DB_NAME=FlowState
PORT=5000
```

## Install Dependencies

Install server dependencies:

```bash
cd server
npm install
```

Install client dependencies:

```bash
cd ../client
npm install
```

## Run in Development

Start backend:

```bash
cd server
npm run dev
```

Start frontend in another terminal:

```bash
cd client
npm run dev
```

Default local URLs:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
