import ChoreoModeler from 'chor-js/lib/Modeler';
import {insertCSS} from 'bpmn-js/test/helper';
import TestContainer from 'mocha-test-container-support';

insertCSS('diagram-js.css', require('bpmn-js/dist/assets/diagram-js.css'));
insertCSS('bpmn-embedded.css', require('bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'));
  
insertCSS('diagram-js-testing.css',
    '.test-container .result { height: 500px; }' + '.test-container > div'
);

export function createModeler(xml, container) {
    const modeler = new ChoreoModeler({
      container
    });
    return modeler.importXML(xml).then(() => {
      return modeler;
    });
}

export function withModeler(xml, func) {
    return function(done) {
        createModeler(xml, TestContainer.get(this)).then(function(modeler) {
            try {
                func(modeler);
            } catch(e) {
                done(e);
            }
            done();
        });
    }
}