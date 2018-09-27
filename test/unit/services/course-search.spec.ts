import { MongoClient, ObjectId } from 'mongodb';
import { RESULTS_PER_PAGE } from '@root/constants.js';
import sinon, { SinonStub } from 'sinon';
import searchCourses from '@services/course-search';

/* tslint:disable:no-unused-expression */

describe('Course Search', () => {
    const RESULT_ARRAY = ['some', 'results'];
    const DEFAULT_COUNT = 0;
    let mongoConnectionStub: SinonStub;
    let mongoCloseStub: SinonStub;
    let mongoDbStub: SinonStub;
    let mongoCollectionStub: SinonStub;
    let collectionInstance;
    let findStub: SinonStub;
    let skipStub: SinonStub;
    let limitStub: SinonStub;
    let toArrayStub: SinonStub;
    let countStub: SinonStub;

    beforeEach(() => {
        // initialize to preserve reference for chaining methods
        collectionInstance = {};

        findStub = sinon.stub().returns(collectionInstance);
        skipStub = sinon.stub().returns(collectionInstance);
        limitStub = sinon.stub().returns(collectionInstance);
        toArrayStub = sinon.stub().returns(RESULT_ARRAY);
        countStub = sinon.stub().returns(DEFAULT_COUNT);

        Object.assign(collectionInstance, {
            find: findStub,
            skip: skipStub,
            limit: limitStub,
            toArray: toArrayStub,
            count: countStub
        });

        mongoCloseStub = sinon.stub();
        mongoCollectionStub = sinon.stub().returns(collectionInstance);

        mongoDbStub = sinon.stub().returns({
            collection: mongoCollectionStub
        });

        mongoConnectionStub = sinon.stub().returns({
            db: mongoDbStub,
            close: mongoCloseStub
        });

        sinon.stub(MongoClient, 'connect').callsFake(mongoConnectionStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return an object with results array', async () => {
        const res = await searchCourses();

        res.should.have.property('results', RESULT_ARRAY);
    });

    it('should build an appropriate query object based on given options', async () => {
        const dayQuery = [ { M: true }, { W: true }, { Th: true } ];
        const timestamp = 1000000000000;
        const objectId = new ObjectId((timestamp / 1000).toString(16) + '0000000000000000');
        const options = {
            building: 'ATL',
            hour: 8,
            minute: 15,
            days: dayQuery.map((dq) => Object.keys(dq)[0]),
            room: '2400',
            timestamp

        };
        const expectedQuery = {
            building: options.building,
            room: options.room,
            $and: [
                {
                    $expr: {
                        $cond: {
                            if: {
                                $eq: ['$startHour', options.hour]
                            },
                            then: {
                                $lte: ['$startMinute', options.minute]
                            },
                            else: {
                                $lt: ['$startHour', options.hour]
                            }
                        }
                    }
                },
                {
                    $expr: {
                        $cond: {
                            if: {
                                $eq: ['$endhour', options.hour]
                            },
                            then: {
                                $gte: ['$endMinute', options.minute]
                            },
                            else: {
                                $gt: ['$endHour', options.hour]
                            }
                        }
                    }
                }
            ],
            $or: dayQuery,
            _id: {
                $lte: objectId
            }
        };

        await searchCourses(options as any);

        findStub.should.have.been.calledOnce;
        findStub.should.have.been.calledWith(expectedQuery);
    });

    it('should build an empty query object given no options', async () => {
        await searchCourses();

        findStub.should.have.been.calledOnce;
        findStub.should.have.been.calledWith({});
    });

    it('should skip/limit for pagination based on given page number', async () => {
        const options = { page: 5 };
        const expectSkipped = options.page * RESULTS_PER_PAGE;

        await searchCourses(options);

        skipStub.should.have.been.calledOnce;
        skipStub.should.have.been.calledWith(expectSkipped);

        limitStub.should.have.been.calledOnce;
        limitStub.should.have.been.calledWith(RESULTS_PER_PAGE);
    });

    it('should not attach pagination info if not needed', async () => {
        countStub.returns(2);
        const res = await searchCourses();

        res.should.not.have.property('paginated');
        res.should.not.have.property('page');
        res.should.not.have.property('totalPages');
        res.should.not.have.property('timestamp');
    });

    it('should attach pagination info if number of results requires pagination', async () => {
        countStub.returns(100);
        const res = await searchCourses();

        res.should.have.property('paginated', true);
        res.should.have.property('page');
        res.should.have.property('totalPages');
        res.should.have.property('timestamp');
    });

    it('should attach pagination info if user specifies `page` option', async () => {
        const page = 3;
        const res = await searchCourses({ page });

        res.should.have.property('paginated', true);
        res.should.have.property('page', page);
        res.should.have.property('totalPages');
        res.should.have.property('timestamp');
    });
});
