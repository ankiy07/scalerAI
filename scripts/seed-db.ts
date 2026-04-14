import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Models
import Board from '../lib/db/models/Board';
import List from '../lib/db/models/List';
import Card from '../lib/db/models/Card';
import User from '../lib/db/models/User';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clean up
    await Board.deleteMany({});
    await List.deleteMany({});
    await Card.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create users (Members)
    const users = await User.create([
      { name: 'John Doe', avatarUrl: 'https://i.pravatar.cc/150?u=john' },
      { name: 'Jane Smith', avatarUrl: 'https://i.pravatar.cc/150?u=jane' },
      { name: 'Bob Wilson', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
    ]);
    console.log('Created users');

    // Create a Board
    const board = await Board.create({
      title: 'Project Roadmap',
      background: '#0079bf',
    });
    console.log('Created board');

    // Create Lists
    const listTitles = ['Backlog', 'In Progress', 'Done'];
    const lists = await Promise.all(
      listTitles.map((title, index) =>
        List.create({
          title,
          order: index,
          boardId: board._id,
        })
      )
    );
    console.log('Created lists');

    // Create Cards
    const cardData = [
      {
        title: 'Design UI Mockups',
        description: 'Create high-fidelity mockups for the main dashboard.',
        listId: lists[0]._id,
        boardId: board._id,
        order: 0,
        labels: [{ text: 'Design', color: 'blue' }],
        members: [users[0]._id, users[1]._id],
        checklists: [
          { text: 'Header design', isCompleted: true },
          { text: 'Board view', isCompleted: false },
        ],
      },
      {
        title: 'Setup Database',
        description: 'Configure MongoDB and define Mongoose schemas.',
        listId: lists[0]._id,
        boardId: board._id,
        order: 1,
        labels: [{ text: 'Backend', color: 'green' }],
        members: [users[2]._id],
      },
      {
        title: 'Develop API Routes',
        description: 'Implement CRUD endpoints for boards, lists, and cards.',
        listId: lists[1]._id,
        boardId: board._id,
        order: 0,
        labels: [{ text: 'Backend', color: 'green' }, { text: 'API', color: 'orange' }],
      },
      {
        title: 'Project Initialization',
        description: 'Setup Next.js project with Tailwind CSS.',
        listId: lists[2]._id,
        boardId: board._id,
        order: 0,
        labels: [{ text: 'Setup', color: 'purple' }],
        dueDate: new Date(),
      },
    ];

    await Card.create(cardData);
    console.log('Created cards');

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
