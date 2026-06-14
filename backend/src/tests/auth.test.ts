import request from 'supertest';
import app from '../app';
import { connectDB, closeDB } from '../config/db';
import User from '../models/User';

jest.setTimeout(60000);

beforeAll(async () => {
  // Connect to database (with automatic MemoryServer fallback)
  await connectDB();
});

afterAll(async () => {
  // Cleanup and disconnect
  await User.deleteMany({});
  await closeDB();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('🔐 Auth API Endpoints Unit Tests', () => {
  const testStudent = {
    name: 'Test Student',
    email: 'student.test@smartlearn.edu',
    password: 'securepassword123',
    role: 'student',
    studentIdNumber: 'SL-88492019',
    department: 'Computer Science'
  };

  describe('POST /api/auth/signup', () => {
    it('should successfully register a student account', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testStudent);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(testStudent.email);
      expect(res.body.user.role).toBe('student');
    });

    it('should fail registration if email already exists', async () => {
      // Register once
      await request(app).post('/api/auth/signup').send(testStudent);

      // Register second time
      const res = await request(app).post('/api/auth/signup').send(testStudent);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Email address already in use');
    });

    it('should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Incomplete' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/signin', () => {
    it('should successfully sign in registered accounts', async () => {
      // 1. Sign up user
      await request(app).post('/api/auth/signup').send(testStudent);

      // 2. Sign in user
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: testStudent.email,
          password: testStudent.password
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testStudent.email);
    });

    it('should block login attempts for suspended accounts', async () => {
      // 1. Sign up user
      await request(app).post('/api/auth/signup').send(testStudent);

      // 2. Mark user as suspended directly in Mongo
      await User.updateOne({ email: testStudent.email }, { $set: { isSuspended: true } });

      // 3. Sign in user
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: testStudent.email,
          password: testStudent.password
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('suspended');
    });

      it('should return error for incorrect password', async () => {
        await request(app).post('/api/auth/signup').send(testStudent);

        const res = await request(app)
          .post('/api/auth/signin')
          .send({
            email: testStudent.email,
            password: 'wrongpassword'
          });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Incorrect email or password');
      });
    });

    describe('👮 Admin & Biometrics Authentication API', () => {
      const testAdmin = {
        name: 'Platform Admin',
        email: 'admin.test@smartlearn.edu',
        password: 'adminpassword123',
        role: 'admin'
      };

      it('should successfully sign up as an administrator', async () => {
        const res = await request(app)
          .post('/api/auth/signup')
          .send(testAdmin);

        expect(res.status).toBe(201);
        expect(res.body.user.role).toBe('admin');
      });

      it('should deny biometric enrollment options if unauthorized', async () => {
        const res = await request(app)
          .post('/api/auth/biometrics/register-options');

        expect(res.status).toBe(401);
      });

      it('should fail biometric login options because it is disabled', async () => {
        await request(app).post('/api/auth/signup').send(testAdmin);

        const res = await request(app)
          .post('/api/auth/biometrics/login-options')
          .send({ email: testAdmin.email });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Biometric features have been disabled.');
      });
    });
  });
