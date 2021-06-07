const mongoose = require('mongoose');
const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
let server;

describe('/api/genres', () => {
    beforeEach(() => { server = require('../../index') });
    afterEach(async () => { 
        await server.close();
        await Genre.deleteMany({});
    });

    describe('GET /', () => {
        it('should return all genres', async () => {
            await Genre.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' }
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return 404 if invalid id is passed', async () => {
            const res = await request(server).get('/api/genres/1');
            expect(res.status).toBe(404);
        });

        it('should return 404 if no genre with the given id exist', async () => {
            const id = mongoose.Types.ObjectId().toHexString();
            const res = await request(server).get('/api/genres/' + id);
            expect(res.status).toBe(404);
        });

        it('should return a genre if valid id is passed', async () => {
            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            const res = await request(server).get(`/api/genres/${genre._id}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });
    });

    describe('POST /', () => {
        let token;
        let name;

        const exec = async () => {
            return await request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';
            
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 5 characters', async () => {
            name = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters', async () => {
            name = new Array(52).join('a');
            
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save the genre if it is valid', async () => {            
            await exec();

            const genre = await Genre.find({ name: 'genre1' });
            expect(genre).not.toBeNull();
        });

        it('should return the genre if it is valid', async () => {            
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        });
    });

    describe('PUT /:id', () => {
        let token;
        let genre;
        let newName;
        let id;

        const exec = async () => {
            return await request(server)
            .put('/api/genres/' + id)
            .set('x-auth-token', token)
            .send({ name: newName });
        }

        beforeEach(async () => {
            token = new User().generateAuthToken();
            newName = 'genre2';
            genre = await new Genre({ name: 'genre1' }).save();
            id = genre._id;
        });

        it('should return 404 if invalid id is passed', async () => {
            id = 1;
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if no genre with the given id exist', async () => {
            id = mongoose.Types.ObjectId().toHexString();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 5 characters', async () => {
            newName = 'a';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters', async () => {
            newName = new Array(52).join('a');
            const res = await exec();

            expect(res.status).toBe(400);
        });
        
        it('should update the genre if name is valid', async () => {
            await exec();

            genre = await Genre.findOne({ name: newName });
            expect(genre.name).toBe(newName);
        });  

        it('should return the genre if name is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', newName);
        }); 
    });

    describe('DELETE /:id', () => {
        let token;
        let genre;
        let id;

        const exec = async () => {
            return await request(server)
            .delete('/api/genres/' + id)
            .set('x-auth-token', token)
            .send();
        }

        beforeEach(async () => {
            token = new User({isAdmin: true}).generateAuthToken();
            genre = await new Genre({ name: 'genre1' }).save();
            id = genre._id;
        });

        it('should return 404 if invalid id is passed', async () => {
            id = 1;
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if no genre with the given id exist', async () => {
            id = mongoose.Types.ObjectId().toHexString();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if client is not an Admin', async () => {
            token = new User({isAdmin: false}).generateAuthToken();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should have deleted the genre if valid id is passed', async () => {
            await exec();

            genre = await Genre.findById(id);
            expect(genre).toBeNull();
        });

        it('should return the genre deleted', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id', genre._id.toHexString());
            expect(res.body).toHaveProperty('name', genre.name);
        });
    });
});