
import { withModeler } from '../testUtils';

const basicChoreography = require('../resources/BasicChoreography.bpmn');

var assert = require('assert');
describe('GreenLight', function() {

    it('Sanity check', function() { 
        assert.equal(42, 42);
    });
    
    it('should have a modeler available', withModeler(basicChoreography, () => {}));
});
