
import TestContainer from 'mocha-test-container-support';
import SubscriptionFinder from '../../app/lib/subscription-visualizer/SubscriptionFinder';
import { withModeler } from '../testUtils';

const basicChoreography = require('../resources/BasicChoreography.bpmn');
const sequentialChoreography = require('../resources/SequentialChoreography.bpmn');

var assert = require('assert');
describe('Subscriptionfinder', function() {
    let container;
    beforeEach(function() {
      container = TestContainer.get(this);
    });
    describe('activities in sequential models', function () {
        it('should subscribe before nearest preceding send', 
            withModeler(sequentialChoreography, container, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity3');
                let sendActivity = registry.get('Activity1');
                expect(finder.findSubscriptionsFor(receiveActivity).subscribeTasks).to.equal([sendActivity]);
            }
        ));

        it('should unsubscribe once the event has arrived, if a preceding send exists', 
            withModeler(sequentialChoreography, container, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity3');
                expect(finder.findSubscriptionsFor(activity).unsubscribeTasks).to.equal([activity]);
            }
        ));

        // it('should subscribe at deploy time when no send is done before', 
        //     withModeler(sequentialChoreography, container, modeler => {
        //         console.log('this is called')
        //         let finder = new SubscriptionFinder();
        //         let registry = modeler.get('elementRegistry');
        //         let activity = registry.get('Activity2');
        //         expect(finder.findSubscriptionsFor(activity).subscribeTasks).to.equal('deploytime');
        //     }
        // ));

        // it('should unsubscribe at undeploy time when no send is done before', function() {
        //     createModeler(sequentialChoreography, container).then(modeler => {
        //         createModeler(sequentialChoreography).then(modeler => {
        //             let finder = new SubscriptionFinder();
        //             let registry = modeler.get('elementRegistry');
        //             let activity = registry.get('Activity2');
        //             assert.equal(finder.findSubscriptionsFor(activity).unsubscribeTasks, 'deploytime');
        //         });
        //     });
        // });
    });
});
