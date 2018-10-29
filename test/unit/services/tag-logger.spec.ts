import winston from 'winston';
import sinon, { SinonStub } from 'sinon';
import tagLogger from '@services/tag-logger';

/* tslint:disable:no-unused-expression */

describe('Tag Logger', () => {
    let winstonLogStub: SinonStub;
    let logger: any;

    const TEST_TAG = 'test-tag';
    const TEST_MESSAGE_1 = 'test-message1';
    const TEST_MESSAGE_2 = 'test-message2';
    const TEST_MESSAGE_3 = 'test-message3';

    beforeEach(() => {
        winstonLogStub = sinon.stub();

        sinon.stub(winston, 'createLogger').returns({
            log: winstonLogStub
        });

        logger = tagLogger(TEST_TAG, true);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should log a tag and a single message', async () => {
        logger.log(TEST_MESSAGE_1);

        winstonLogStub.should.have.been.calledWith({
            level: 'info',
            message: `${TEST_TAG}: ${TEST_MESSAGE_1}`
        });
    });

    it('should accept a variable number of arguments', async () => {
        logger.log(TEST_MESSAGE_1, TEST_MESSAGE_2, TEST_MESSAGE_3);

        winstonLogStub.should.have.been.calledWith({
            level: 'info',
            message: `${TEST_TAG}: ${TEST_MESSAGE_1} ${TEST_MESSAGE_2} ${TEST_MESSAGE_3}`
        });
    });

    it('should log level "info" for the generic log method', async () => {
        logger.log(TEST_MESSAGE_1, TEST_MESSAGE_2);

        winstonLogStub.should.have.been.calledWithMatch({
            level: 'info'
        });
    });

    it('should support the "error" log level', async () => {
        logger.error(TEST_MESSAGE_1, TEST_MESSAGE_2);

        winstonLogStub.should.have.been.calledWithMatch({
            level: 'error'
        });
    });

    it('should support the "warn" log level', async () => {
        logger.warn(TEST_MESSAGE_1, TEST_MESSAGE_2);

        winstonLogStub.should.have.been.calledWithMatch({
            level: 'warn'
        });
    });

    it('should support the "info" log level', async () => {
        logger.info(TEST_MESSAGE_1, TEST_MESSAGE_2);

        winstonLogStub.should.have.been.calledWithMatch({
            level: 'info'
        });
    });

    it('should support the "verbose" log level', async () => {
        logger.verbose(TEST_MESSAGE_1, TEST_MESSAGE_2);

        winstonLogStub.should.have.been.calledWithMatch({
            level: 'verbose'
        });
    });

    it('should support the "debug" log level', async () => {
        logger.debug(TEST_MESSAGE_1, TEST_MESSAGE_2);

        winstonLogStub.should.have.been.calledWithMatch({
            level: 'debug'
        });
    });

    it('should support the "silly" log level', async () => {
        logger.silly(TEST_MESSAGE_1, TEST_MESSAGE_2);

        winstonLogStub.should.have.been.calledWithMatch({
            level: 'silly'
        });
    });
});
