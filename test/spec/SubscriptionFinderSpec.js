
import SubscriptionFinder, { DEPLOYMENT_TIME, UNDEPLOYMENT_TIME } from '../../app/lib/subscription-visualizer/SubscriptionFinder';
import { withModeler } from '../testUtils';

const basicChoreography = require('../resources/BasicChoreography.bpmn');
const sequentialChoreography = require('../resources/SequentialChoreography.bpmn');
const parallelChoreography = require('../resources/ParallelChoreography.bpmn');
const exclusiveChoreography = require('../resources/ExclusiveChoreography.bpmn');

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
                expect(subscriptions.subscribeTasks).to.have.same.members([sendActivity]);
            }
        ));

        it('should unsubscribe once the event has arrived, if a preceding send exists', 
            withModeler(sequentialChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity3');
                expect(finder.findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([activity]);
            }
        ));

        it('should subscribe at deploy time when no send is done before', 
            withModeler(sequentialChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity2');
                expect(finder.findSubscriptionsFor(activity).subscribeTasks).to.have.same.members([DEPLOYMENT_TIME]);
            }
        ));

        it('should unsubscribe at undeploy time when no send is done before', 
            withModeler(sequentialChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity2');
                expect(finder.findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([UNDEPLOYMENT_TIME]);
            }
        ));
    });

    describe('activities in models with parallel gateways', function () {
        it('should subscribe before nearest preceding send in any path', 
            withModeler(parallelChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity3');
                let sendActivity = registry.get('Activity1');
                let subscriptions = finder.findSubscriptionsFor(receiveActivity);
                expect(subscriptions.subscribeTasks).to.have.same.members([sendActivity]);
            }
        ));

        it('should unsubscribe once the event has arrived, if a preceding send exists in any path', 
            withModeler(parallelChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity3');
                expect(finder.findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([activity]);
            }
        ));

        it('should subscribe at deploy time when there is no path where a send is done before', 
            withModeler(parallelChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity2');
                expect(finder.findSubscriptionsFor(activity).subscribeTasks).to.have.same.members([DEPLOYMENT_TIME]);
            }
        ));

        it('should unsubscribe at undeploy time when there is no path where a send is done before', 
            withModeler(parallelChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity2');
                expect(finder.findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([UNDEPLOYMENT_TIME]);
            }
        ));
    });

    describe('activities in models with exclusive or event-based gateways', function () {
        it('should subscribe before all nearest preceding sends in all path', 
            withModeler(exclusiveChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity3');
                let sendActivities = [registry.get('Activity1a'), registry.get('Activity2b')];
                expect(finder.findSubscriptionsFor(receiveActivity).subscribeTasks).to.have.same.members(sendActivities);
            }
        ));

        it('should unsubscribe once the event has arrived, if preceding sends exists in all paths', 
            withModeler(exclusiveChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity3');
                expect(finder.findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([activity]);
            }
        ));

        it('should subscribe at deploy time when there is a path where no send is done before', 
            withModeler(exclusiveChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity4');
                expect(finder.findSubscriptionsFor(activity).subscribeTasks).to.have.same.members([DEPLOYMENT_TIME]);
            }
        ));

        it('should unsubscribe at undeploy time when there is a path where no send is done before', 
            withModeler(exclusiveChoreography, modeler => {
                let finder = new SubscriptionFinder();
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity4');
                expect(finder.findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([UNDEPLOYMENT_TIME]);
            }
        ));
    });

});
