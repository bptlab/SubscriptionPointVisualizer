import ChoreoModeler from 'chor-js/lib/Modeler';
import {insertCSS} from 'bpmn-js/test/helper';
  
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

export function withModeler(xml, container, func) {
    return function(done) {
        createModeler(xml, container).then(function() {
            func(modeler);
            done();
        });
    }
}