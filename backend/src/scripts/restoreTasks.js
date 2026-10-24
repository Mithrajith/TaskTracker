import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import StudentTask from '../models/StudentTask.js';
import { TASK_STATUS, STUDENT_TASK_STATUS, ROLES, ACCOUNT_STATUS } from '../config/constants.js';

dotenv.config();

const tasksToRestore = [
  {
    taskNumber: 1,
    title: 'Python Virtual Environments & uv Setup for AI Engineering',
    description: 'Setup a standardized development environment using uv, Python 3.12, and pyproject.toml.',
    instructions: '1. Install uv on your operating system.\n2. Create an AI development workspace and virtual environment.\n3. Install NumPy and PyTorch with CPU/CUDA wheels.\n4. Take a screenshot showing your active environment, python version, and successful tensor multiplication output.',
    status: TASK_STATUS.PUBLISHED,
    publishedAt: new Date(),
  },
  {
    taskNumber: 2,
    title: 'Vector Embeddings Generation & Cosine Similarity',
    description: 'Implement text embeddings using sentence-transformers and calculate cosine similarity between AI roadmaps.',
    instructions: '1. Load an open-source sentence-transformer model (e.g. all-MiniLM-L6-v2).\n2. Embed 5 sample technical documents.\n3. Calculate dot product and cosine similarity matrices.\n4. Save and take a screenshot of your benchmark script execution.',
    status: TASK_STATUS.PUBLISHED,
    publishedAt: new Date(),
  },
  {
    taskNumber: 3,
    title: 'RAG Pipeline with Chunking & Semantic Search',
    description: 'Build an end-to-end naive RAG pipeline with text chunking, local vector indexing, and context retrieval.',
    instructions: '1. Ingest a 10-page AI research paper PDF.\n2. Chunk text with recursive character chunker (size: 500, overlap: 50).\n3. Index into memory or local vector store.\n4. Query top-3 chunks and verify retrieval precision.\n5. Screenshot results and provide repo link.',
    status: TASK_STATUS.DRAFT,
  }
];

export const restoreTasks = async () => {
  try {
    await connectDB();
    const admin = await User.findOne({ role: ROLES.ADMIN });
    const adminId = admin ? admin._id : null;

    console.log('Restoring tasks in database...');

    for (const taskDef of tasksToRestore) {
      const existing = await Task.findOne({ taskNumber: taskDef.taskNumber });
      if (!existing) {
        const created = await Task.create({
          ...taskDef,
          createdBy: adminId,
        });
        console.log(`✓ Recreated Task #${created.taskNumber}: "${created.title}" (${created.status})`);
      } else {
        console.log(`- Task #${existing.taskNumber} already exists in DB.`);
      }
    }

    // Now auto-assign Task 1 to all active students who don't have it
    const task1 = await Task.findOne({ taskNumber: 1, status: TASK_STATUS.PUBLISHED });
    if (task1) {
      const activeStudents = await User.find({
        role: ROLES.STUDENT,
        status: ACCOUNT_STATUS.ACTIVE,
      });

      console.log(`Checking ${activeStudents.length} active students for Task 1 assignment...`);
      let assignedCount = 0;

      for (const student of activeStudents) {
        const existingAssignment = await StudentTask.findOne({
          student: student._id,
          task: task1._id,
        });

        if (!existingAssignment) {
          await StudentTask.create({
            student: student._id,
            task: task1._id,
            status: STUDENT_TASK_STATUS.ASSIGNED,
            unlockedAt: new Date(),
            isStudentCompleted: false,
          });
          assignedCount++;
        }
      }

      console.log(`✓ Successfully assigned Task 1 to ${assignedCount} students!`);
    }

    console.log('Task restoration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Restoration failed:', err);
    process.exit(1);
  }
};

if (process.argv[1]?.endsWith('restoreTasks.js')) {
  restoreTasks();
}
