import 'module-alias/register';
import _chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
_chai.use(sinonChai);
_chai.use(chaiAsPromised);
_chai.should();
