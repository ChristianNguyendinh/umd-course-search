const { MongoClient } = require('mongodb');
const { mongodb: MONGO_CONFIG } = require('@root/config.json');
const sinon = require('sinon');
const mongoCollectionConnect = require('@services/mongo-collection-connect').default;

describe('Mongo Collection Connect', () => {
    let mongoConnectionStub;
    let mongoCloseStub;
    let mongoDbStub;
    let mongoCollectionStub;
    let callbackStub;

    beforeEach(() => {
        mongoCloseStub = sinon.stub();
        mongoCollectionStub = sinon.stub();
        callbackStub = sinon.stub();

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

    it('should connect to appropriate MongoDB database and collection', async () => {
        await mongoCollectionConnect(MONGO_CONFIG.courses, callbackStub);

        mongoConnectionStub.should.have.been.calledOnce;
        mongoConnectionStub.should.have.been.calledWith(MONGO_CONFIG.url);

        mongoDbStub.should.have.been.calledOnce;
        mongoDbStub.should.have.been.calledWith(MONGO_CONFIG.database);

        mongoCollectionStub.should.have.been.calledOnce;
        mongoCollectionStub.should.have.been.calledWith(MONGO_CONFIG.courses);

        mongoCloseStub.should.have.been.calledOnce;
    });

    it('should close the MongoClient on error', async () => {
        const errorMessage = 'Test Error Message';
        mongoCollectionStub.throws(new Error(errorMessage));

        await (mongoCollectionConnect(MONGO_CONFIG.courses, callbackStub)).should.be.rejectedWith(Error, errorMessage);

        mongoCloseStub.should.have.been.calledOnce;
    });
});
