const proxyquire = require('proxyquire');
const sinon = require('sinon');
const Koa = require('koa');
const supertest = require('supertest');

describe('Search Routes', () => {
    describe('Course Search', () => {
        let searchCoursesStub;
        let courseSearchRoutes;
        let request;
        let server;
        const MOCK_RESPONSE = { 'results': [ 'some', 'test', 'results' ] };
        const MOCK_FULL_REQUEST = {
            building: 'ATL',
            hour: 5,
            minute: 30,
            days: [ 'Tu', 'Th' ],
            room: '2400',
            timestamp: 100,
            page: 1
        };
        const expectBadRequest = async (requestBody) => {
            return await request
                .post('/courses')
                .send(requestBody)
                .expect(400);
        };

        beforeEach(() => {
            searchCoursesStub = sinon.stub().returns(MOCK_RESPONSE);

            courseSearchRoutes = proxyquire('@routes/search/search-routes', {
                '@services/course-search': searchCoursesStub
            });

            const app = new Koa();
            app.use(courseSearchRoutes);

            server = app.listen();
            request = supertest(server);
        });

        afterEach(() => {
            sinon.restore();
            server.close();
        });

        it('should work with a full valid payload', async () => {
            const res = await request
                .post('/courses')
                .send(MOCK_FULL_REQUEST)
                .expect(200);

            res.body.should.deep.equal(MOCK_RESPONSE);
        });

        it('should work with a empty payload', async () => {
            const res = await request
                .post('/courses')
                .send({})
                .expect(200);

            res.body.should.deep.equal(MOCK_RESPONSE);
        });

        it('should error with invalid types', async () => {
            const MOCK_BAD_TYPES_REQUEST = {
                building: 5,
                hour: '5',
                minute: '30',
                days: { 'Tu': 'Th' },
                room: 2400,
                timestamp: '100',
                page: '1'
            };
            await expectBadRequest(MOCK_BAD_TYPES_REQUEST);
        });

        it('should error with bad day strings', async () => {
            const BAD_DAYS_REQUEST = {
                days: [ 'G', 'F' ]
            };
            await expectBadRequest(BAD_DAYS_REQUEST);
        });

        it('should error with bad hour and minutes', async () => {
            const BAD_TIME_REQUEST_1 = {
                hour: 15,
                minute: 64
            };
            const BAD_TIME_REQUEST_2 = {
                hour: -2,
                minute: -1
            };
            await expectBadRequest(BAD_TIME_REQUEST_1);
            await expectBadRequest(BAD_TIME_REQUEST_2);
        });
    });
});
