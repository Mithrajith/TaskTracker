import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Task from '../src/models/Task.js';
import StudentTask from '../src/models/StudentTask.js';
import Submission from '../src/models/Submission.js';
import TaskReview from '../src/models/TaskReview.js';

let adminToken = '';
let student1Token = '';
let studentNewToken = '';
let sampleTaskId = '';
let student1TaskId = '';
let pendingSubmissionId = '';
let proofFileId = '';

const validPngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  0x42, 0x60, 0x82,
]);

describe('AI Engineer Task Tracker API Tests', () => {
  before(async () => {
    await connectDB();
    // Create dedicated test students
    await User.deleteMany({ registerNumber: /^TEST_SUITE_/ });
    await User.create({
      name: 'Test Student One',
      registerNumber: 'TEST_SUITE_001',
      githubRepoUrl: 'https://github.com/test-student-1',
      password: 'TestPassword123!',
      role: 'student',
      status: 'active',
      mustChangePassword: false,
    });
    await User.create({
      name: 'Test Student New',
      registerNumber: 'TEST_SUITE_NEW',
      githubRepoUrl: 'https://github.com/test-student-new',
      password: 'TestPassword123!',
      role: 'student',
      status: 'active',
      mustChangePassword: true,
    });
  });

  after(async () => {
    // Cleanup any test tasks and test students created during test run
    await Task.deleteMany({});
    await StudentTask.deleteMany({});
    await Submission.deleteMany({});
    await TaskReview.deleteMany({});
    await User.deleteMany({ registerNumber: /^TEST_/ });
    await mongoose.connection.close();
  });

  test('1. Health Check & Root Endpoint', async () => {
    const rootRes = await request(app).get('/');
    assert.equal(rootRes.status, 200);
    assert.equal(rootRes.body.success, true);
    assert.equal(rootRes.body.database.connected, true);

    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  test('2. Admin Login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        registerNumber: 'ADMIN001',
        password: 'AdminPassword123!',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'admin');
    adminToken = res.body.token;
  });

  test('3. Student Login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        registerNumber: 'TEST_SUITE_001',
        password: 'TestPassword123!',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'student');
    student1Token = res.body.token;
  });

  test('4. Login with invalid password returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        registerNumber: 'ADMIN001',
        password: 'WrongPassword!',
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('5. Enforce mandatory password change for new student', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        registerNumber: 'TEST_SUITE_NEW',
        password: 'TestPassword123!',
      });

    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.user.mustChangePassword, true);
    studentNewToken = loginRes.body.token;

    // Accessing student tasks without changing password is blocked with 403
    const tasksRes = await request(app)
      .get('/api/v1/student-tasks')
      .set('Authorization', `Bearer ${studentNewToken}`);

    assert.equal(tasksRes.status, 403);
    assert.equal(tasksRes.body.requirePasswordChange, true);

    // Change password
    const changeRes = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${studentNewToken}`)
      .send({
        newPassword: 'BrandNewSecurePassword123!',
      });

    assert.equal(changeRes.status, 200);
    assert.equal(changeRes.body.success, true);

    // Now accessing student tasks succeeds
    const afterRes = await request(app)
      .get('/api/v1/student-tasks')
      .set('Authorization', `Bearer ${studentNewToken}`);

    assert.equal(afterRes.status, 200);
  });

  test('6. RBAC: Student cannot access admin endpoints', async () => {
    const listRes = await request(app)
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${student1Token}`);

    assert.equal(listRes.status, 403);

    const createRes = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        title: 'Hacked Task',
        description: 'Should fail',
        instructions: 'Should fail',
      });

    assert.equal(createRes.status, 403);
  });

  test('7. Admin Bulk CSV Import creates student accounts with mustChangePassword=true', async () => {
    const csvContent =
      'register_number,name,github_link\n' +
      'TEST_CSV_001,Amit Kumar,https://github.com/amit-ai\n' +
      'TEST_CSV_002,Pooja Hegde,https://github.com/pooja-dev';

    const res = await request(app)
      .post('/api/v1/students/import-csv')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        csvText: csvContent,
        defaultPassword: 'TempStudent123!',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.createdCount, 2);
    assert.equal(res.body.data.skippedCount, 0);

    const createdUser = await User.findOne({ registerNumber: 'TEST_CSV_001' });
    assert.ok(createdUser);
    assert.equal(createdUser.mustChangePassword, true);
  });

  test('8. Admin creates a new Task dynamically', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'TEST_Task 1: Python Virtual Environments',
        description: 'Setup a standardized development environment using uv and Python 3.12.',
        instructions: '1. Install uv.\n2. Create venv.\n3. Verify numpy.',
        status: 'draft',
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.data.taskNumber >= 1);
    sampleTaskId = res.body.data._id;
  });

  test('9. Admin checks eligible students for newly created task', async () => {
    const res = await request(app)
      .get(`/api/v1/tasks/${sampleTaskId}/eligible-students`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  test('10. Admin publishes Task 1, assigning it to eligible students', async () => {
    const res = await request(app)
      .post(`/api/v1/tasks/${sampleTaskId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const myTasksRes = await request(app)
      .get('/api/v1/student-tasks')
      .set('Authorization', `Bearer ${student1Token}`);

    assert.equal(myTasksRes.status, 200);
    const assigned = myTasksRes.body.data.assignedTasks.find(
      (t) => String(t.task?._id) === String(sampleTaskId)
    );
    assert.ok(assigned, 'Student 1 must have the published task assigned');
    student1TaskId = assigned._id;
  });

  test('11. File Upload Validation: Rejects invalid fake image files', async () => {
    const fakeBuffer = Buffer.from('This is a plain text file, not a real PNG image!');
    const res = await request(app)
      .post('/api/v1/submissions')
      .set('Authorization', `Bearer ${student1Token}`)
      .field('studentTaskId', student1TaskId)
      .field('explanation', 'Here is my work')
      .attach('proofImage', fakeBuffer, {
        filename: 'fake.png',
        contentType: 'image/png',
      });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /Invalid file format/i);
  });

  test('12. File Upload & Submission: Successfully uploads valid PNG proof without githubUrl and optional explanation', async () => {
    const res = await request(app)
      .post('/api/v1/submissions')
      .set('Authorization', `Bearer ${student1Token}`)
      .field('studentTaskId', student1TaskId)
      .field('explanation', 'Completed uv virtualenv configuration.')
      .attach('proofImage', validPngBuffer, {
        filename: 'valid_proof.png',
        contentType: 'image/png',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.fileId);
    proofFileId = res.body.data.fileId;
    pendingSubmissionId = res.body.data._id;
  });

  test('13. Proof Image Retrieval Security: Owner student can access image, other student cannot', async () => {
    const ownerRes = await request(app)
      .get(`/api/v1/files/${proofFileId}`)
      .set('Authorization', `Bearer ${student1Token}`);

    assert.equal(ownerRes.status, 200);
    assert.ok(
      ['image/webp', 'image/png'].includes(ownerRes.headers['content-type']),
      `Content type ${ownerRes.headers['content-type']} should be image/webp or image/png`
    );

    const otherRes = await request(app)
      .get(`/api/v1/files/${proofFileId}`)
      .set('Authorization', `Bearer ${studentNewToken}`);

    assert.equal(otherRes.status, 403);

    const adminRes = await request(app)
      .get(`/api/v1/files/${proofFileId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(adminRes.status, 200);
  });

  test('14. Admin Review: Request corrections on submission requiring feedback', async () => {
    const badRes = await request(app)
      .post(`/api/v1/reviews/${pendingSubmissionId}/request-changes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ feedback: '' });

    assert.equal(badRes.status, 400);

    const goodRes = await request(app)
      .post(`/api/v1/reviews/${pendingSubmissionId}/request-changes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ feedback: 'Please verify pip list output and resubmit.' });

    assert.equal(goodRes.status, 200);
    assert.equal(goodRes.body.data.studentTask.status, 'changes_requested');
  });

  test('15. Admin Review: Approves submission and protects against duplicate approvals', async () => {
    const resubRes = await request(app)
      .post('/api/v1/submissions')
      .set('Authorization', `Bearer ${student1Token}`)
      .field('studentTaskId', student1TaskId)
      .field('explanation', 'Updated with pip list output.')
      .attach('proofImage', validPngBuffer, {
        filename: 'proof_v2.png',
        contentType: 'image/png',
      });

    assert.equal(resubRes.status, 201);
    const newSubId = resubRes.body.data._id;

    const approveRes = await request(app)
      .post(`/api/v1/reviews/${newSubId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ feedback: 'Verified! Excellent work.' });

    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.body.data.studentTask.status, 'approved');

    const dupRes = await request(app)
      .post(`/api/v1/reviews/${newSubId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ feedback: 'Duplicate approval attempt' });

    assert.equal(dupRes.status, 400);
    assert.match(dupRes.body.message, /already been approved/i);
  });

  test('16. Admin Analytics Overview Endpoint', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.totalStudents >= 1);
    assert.ok(typeof res.body.data.tasksPublished === 'number');
  });

  test('17. Admin deletes task and cleans up assignments', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${sampleTaskId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const deleted = await Task.findById(sampleTaskId);
    assert.equal(deleted, null);
  });
});
