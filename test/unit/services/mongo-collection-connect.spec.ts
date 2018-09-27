import { MongoClient } from 'mongodb';
import { mongodb as MONGO_CONFIG } from '@root/config.json';
import sinon, { SinonStub } from 'sinon';
import mongoCollectionConnect from '@services/mongo-collection-connect';

/* tslint:disable:no-unused-expression */

describe('Mongo Collection Connect', () => {
    let mongoConnectionStub: SinonStub;
    let mongoCloseStub: SinonStub;
    let mongoDbStub: SinonStub;
    let mongoCollectionStub: SinonStub;
    let callbackStub: SinonStub;

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
