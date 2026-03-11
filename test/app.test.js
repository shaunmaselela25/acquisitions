import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';

describe('API Endpoints', () => {
    describe('GET /', () => {
        it('should return welcome message', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toEqual(200);
            expect(res.text).toBe('Welcome to acquisitions API!');
        });
    });

    describe('GET /health', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'OK');
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body).toHaveProperty('uptime');
        });
    });

    describe('GET /api', () => {
        it('should return API status message', async () => {
            const res = await request(app).get('/api');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Acquisitions API is running');
        });
    });
}); 

describe('GET /nonexistent', () => {
    it('should return 404 for non-existent endpoint', async () => {
        const res = await request(app).get('/nonexistent');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('error', 'Not found');
    });
});
