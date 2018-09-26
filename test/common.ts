require('module-alias/register');
const _chai = require("chai");
const sinonChai = require("sinon-chai");
const chaiAsPromised = require('chai-as-promised');
_chai.use(sinonChai);
_chai.use(chaiAsPromised);
_chai.should();
