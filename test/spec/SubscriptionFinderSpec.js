
import SubscriptionFinder, { DEPLOYMENT_TIME, UNDEPLOYMENT_TIME } from '../../app/lib/subscription-visualizer/SubscriptionFinder';
import { withModeler } from '../testUtils';

const basicChoreography = require('../resources/BasicChoreography.bpmn');
const sequentialChoreography = require('../resources/SequentialChoreography.bpmn');

var assert = require('assert');
describe('Subscriptionfinder', function() {

    describe('activities in sequential models', function () {
        it('should subscribe before nearest preceding send', 
            withModeler(sequentialChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity3');
                let sendActivity = registry.get('Activity1');
                let subscriptions = finder.findSubscriptionsFor(receiveActivity);
                expect(subscriptions.subscribeTasks).to.eql([sendActivity]);
            }
        ));

        it('should unsubscribe once the event has arrived, if a preceding send exists', 
            withModeler(sequentialChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity3');
                expect(finder.findSubscriptionsFor(activity).unsubscribeTasks).to.eql([activity]);
            }
        ));

        it('should subscribe at deploy time when no send is done before', 
            withModeler(sequentialChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity2');
                expect(finder.findSubscriptionsFor(activity).subscribeTasks).to.eql([DEPLOYMENT_TIME]);
            }
        ));

        it('should unsubscribe at undeploy time when no send is done before', 
            withModeler(sequentialChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity2');
                expect(finder.findSubscriptionsFor(activity).unsubscribeTasks).to.eql([UNDEPLOYMENT_TIME]);
            }
        ));
    });
});
