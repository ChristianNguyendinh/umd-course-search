import winston from 'winston';
import sinon, { SinonStub } from 'sinon';
import tagLogger from '@services/tag-logger';

/* tslint:disable:no-unused-expression */

describe('Tag Logger', () => {
    let winstonLogStub: SinonStub;
    let logger: any;

    const TEST_TAG = 'test-tag';
    const TEST_MESSAGE = 'test-message';

    beforeEach(() => {
        winstonLogStub = sinon.stub();

        sinon.stub(winston, 'createLogger').returns({
            log: winstonLogStub
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should log a tag', async () => {
        logger = tagLogger(TEST_TAG, true);

        logger.log(TEST_MESSAGE);

        winstonLogStub.should.have.been.calledOnce;
    });
});
