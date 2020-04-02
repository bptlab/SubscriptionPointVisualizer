
import findSubscriptionsFor, { DEPLOYMENT_TIME, UNDEPLOYMENT_TIME } from '../../app/lib/subscription-visualizer/SubscriptionFinder';
import { withModeler } from '../testUtils';

const basicChoreography = require('../resources/BasicChoreography.bpmn');
const sequentialChoreography = require('../resources/SequentialChoreography.bpmn');
const parallelChoreography = require('../resources/ParallelChoreography.bpmn');
const exclusiveChoreography = require('../resources/ExclusiveChoreography.bpmn');
const complexChoreography = require('../resources/ComplexChoreography.bpmn');
const unsubscribeChoreography = require('../resources/UnsubscribeChoreography.bpmn');
const emptyAlternativeChoreography = require('../resources/EmptyAlternativeChoreography.bpmn');
const exclusiveRegressionChoreography = require('../resources/ExclusiveRegressionChoreography.bpmn');
const nestedExclusiveChoreography = require('../resources/NestedExclusiveChoreography.bpmn');

var assert = require('assert');
describe('Subscriptionfinder', function() {

    describe('activities in sequential models', function () {
        it('should subscribe before nearest preceding send', 
            withModeler(sequentialChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity3');
                let sendActivity = registry.get('Activity1');
                expect(findSubscriptionsFor(receiveActivity).subscribeTasks).to.have.same.members([sendActivity]);
            }
        ));

        it('should unsubscribe once the event has arrived, if a preceding send exists', 
            withModeler(sequentialChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity3');
                expect(findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([activity]);
            }
        ));

        it('should subscribe at deploy time when no send is done before', 
            withModeler(sequentialChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity2');
                expect(findSubscriptionsFor(activity).subscribeTasks).to.have.same.members([DEPLOYMENT_TIME]);
            }
        ));

        it('should unsubscribe at undeploy time when no send is done before', 
            withModeler(sequentialChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity2');
                expect(findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([UNDEPLOYMENT_TIME]);
            }
        ));
    });

    describe('activities in models with parallel gateways', function () {
        it('should subscribe before nearest preceding send in any path', 
            withModeler(parallelChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity3');
                let sendActivity = registry.get('Activity1');
                let subscriptions = findSubscriptionsFor(receiveActivity);
                expect(subscriptions.subscribeTasks).to.have.same.members([sendActivity]);
            }
        ));

        it('should unsubscribe once the event has arrived, if a preceding send exists in any path', 
            withModeler(parallelChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity3');
                expect(findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([activity]);
            }
        ));

        it('should subscribe at deploy time when there is no path where a send is done before', 
            withModeler(parallelChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity2');
                expect(findSubscriptionsFor(activity).subscribeTasks).to.have.same.members([DEPLOYMENT_TIME]);
            }
        ));

        it('should unsubscribe at undeploy time when there is no path where a send is done before', 
            withModeler(parallelChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity2');
                expect(findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([UNDEPLOYMENT_TIME]);
            }
        ));
    });

    describe('activities in models with exclusive or event-based gateways', function () {
        it('should subscribe before all nearest preceding sends in all path', 
            withModeler(exclusiveChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity3');
                let sendActivities = [registry.get('Activity1a'), registry.get('Activity2b')];
                expect(findSubscriptionsFor(receiveActivity).subscribeTasks).to.have.same.members(sendActivities);
            }
        ));

        it('should unsubscribe once the event has arrived, if preceding sends exists in all paths', 
            withModeler(exclusiveChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity3');
                expect(findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([activity]);
            }
        ));

        it('should subscribe at deploy time when there is a path where no send is done before', 
            withModeler(exclusiveChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity4');
                expect(findSubscriptionsFor(activity).subscribeTasks).to.have.same.members([DEPLOYMENT_TIME]);
            }
        ));

        it('should unsubscribe at undeploy time when there is a path where no send is done before', 
            withModeler(exclusiveChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let activity = registry.get('Activity4');
                expect(findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([UNDEPLOYMENT_TIME]);
            }
        ));

        it('should unsubscribe in other branch, as soon as an event indicates that the other branch has been chosen', 
            withModeler(unsubscribeChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity2');
                let concurrentActivity = registry.get('Activity1');
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([receiveActivity, concurrentActivity]);
            }
        ));

        it('should unsubscribe at undeployment, if there is a path where no event indicates that another branch has been chosen', 
            withModeler(unsubscribeChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity1');
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([UNDEPLOYMENT_TIME]);
            }
        ));
        
        it('should unsubscribe in a following task, as soon as an event indicates that another branch has been chosen', 
            withModeler(complexChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity2a');
                let concurrentActivity = registry.get('Activity2b');
                let followingActivity = registry.get('Activity3');
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([receiveActivity, concurrentActivity, followingActivity]);
            }
        ));

        it('should unsubscribe in a following task, as soon as an event indicates that another branch has been chosen, even when one alternative is empty', 
            withModeler(emptyAlternativeChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity1');
                let followingActivity = registry.get('Activity2');
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([receiveActivity, followingActivity]);
            }
        ));
    });


    describe('regression of', function () {
        it('subscription with exclusive gateways in and before parallel', 
            withModeler(complexChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity3');
                let sendActivities = [registry.get('Activity1a'), registry.get('Activity1b')];
                expect(findSubscriptionsFor(receiveActivity).subscribeTasks).to.have.same.members(sendActivities);
            }
        ));

        it('subscription over multiple differently typed gateways', 
            withModeler(complexChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity4');
                let sendActivities = [registry.get('Activity0a'), registry.get('Activity0b')];
                expect(findSubscriptionsFor(receiveActivity).subscribeTasks).to.have.same.members(sendActivities);
            }
        ));

        it('when subscribe already is on one alternative, no unsubscribe is needed on the other one', 
            withModeler(exclusiveRegressionChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity1b');
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([receiveActivity]);
            }
        ));

        it('duplicate unsubscribe in alternative sequence', 
            withModeler(exclusiveRegressionChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity2b');
                let concurrentActivity = registry.get('Activity1a');
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([receiveActivity, concurrentActivity]);
            }
        ));

        it('duplicate unsubscribe in alternative nested exclusive gateway', 
            withModeler(nestedExclusiveChoreography, modeler => {
                let registry = modeler.get('elementRegistry');
                let receiveActivity = registry.get('Activity1');
                let concurrentActivities = [registry.get('Activity2a'), registry.get('Activity2b')];
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([receiveActivity].concat(concurrentActivities));
            }
        ));
    });

});
