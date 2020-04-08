
import findSubscriptionsFor, { DEPLOYMENT_TIME, UNDEPLOYMENT_TIME } from '../../app/lib/subscription-visualizer/SubscriptionFinder';
import { withElements } from '../testUtils';

const basicChoreography = require('../resources/BasicChoreography.bpmn');
const sequentialChoreography = require('../resources/SequentialChoreography.bpmn');
const parallelChoreography = require('../resources/ParallelChoreography.bpmn');
const exclusiveChoreography = require('../resources/ExclusiveChoreography.bpmn');
const complexChoreography = require('../resources/ComplexChoreography.bpmn');
const unsubscribeChoreography = require('../resources/UnsubscribeChoreography.bpmn');
const emptyAlternativeChoreography = require('../resources/EmptyAlternativeChoreography.bpmn');
const exclusiveRegressionChoreography = require('../resources/ExclusiveRegressionChoreography.bpmn');
const nestedExclusiveChoreography = require('../resources/NestedExclusiveChoreography.bpmn');
const multipleExclusiveChoreography = require('../resources/MultipleExclusiveChoreography.bpmn');

var assert = require('assert');
describe('Subscriptionfinder', function() {

    describe('test infrastructure', function () {

        it('should be running', function() {assert.equal(42, 42);});
        
        it('should have access to the model elements', withElements(basicChoreography, elements => {
            expect(elements.get('Activity')).to.exist;
        }));

    });
    

    describe('activities in sequential models', function () {
        it('should subscribe before nearest preceding send', 
            withElements(sequentialChoreography, elements => {
                let receiveActivity = elements.get('Activity3');
                let sendActivity = elements.get('Activity1');
                expect(findSubscriptionsFor(receiveActivity).subscribeTasks).to.have.same.members([sendActivity]);
            }
        ));

        it('should unsubscribe once the event has arrived, if a preceding send exists', 
            withElements(sequentialChoreography, elements => {
                let activity = elements.get('Activity3');
                expect(findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([activity]);
            }
        ));

        it('should subscribe at deploy time when no send is done before', 
            withElements(sequentialChoreography, elements => {
                let activity = elements.get('Activity2');
                expect(findSubscriptionsFor(activity).subscribeTasks).to.have.same.members([DEPLOYMENT_TIME]);
            }
        ));

        it('should unsubscribe at undeploy time when no send is done before', 
            withElements(sequentialChoreography, elements => {
                let activity = elements.get('Activity2');
                expect(findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([UNDEPLOYMENT_TIME]);
            }
        ));
    });

    describe('activities in models with parallel gateways', function () {
        it('should subscribe before nearest preceding send in any path', 
            withElements(parallelChoreography, elements => {
                let receiveActivity = elements.get('Activity3');
                let sendActivity = elements.get('Activity1');
                let subscriptions = findSubscriptionsFor(receiveActivity);
                expect(subscriptions.subscribeTasks).to.have.same.members([sendActivity]);
            }
        ));

        it('should unsubscribe once the event has arrived, if a preceding send exists in any path', 
            withElements(parallelChoreography, elements => {
                let activity = elements.get('Activity3');
                expect(findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([activity]);
            }
        ));

        it('should subscribe at deploy time when there is no path where a send is done before', 
            withElements(parallelChoreography, elements => {
                let activity = elements.get('Activity2');
                expect(findSubscriptionsFor(activity).subscribeTasks).to.have.same.members([DEPLOYMENT_TIME]);
            }
        ));

        it('should unsubscribe at undeploy time when there is no path where a send is done before', 
            withElements(parallelChoreography, elements => {
                let activity = elements.get('Activity2');
                expect(findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([UNDEPLOYMENT_TIME]);
            }
        ));
    });

    describe('activities in models with exclusive or event-based gateways', function () {
        it('should subscribe before all nearest preceding sends in all path', 
            withElements(exclusiveChoreography, elements => {
                let receiveActivity = elements.get('Activity3');
                let sendActivities = [elements.get('Activity1a'), elements.get('Activity2b')];
                expect(findSubscriptionsFor(receiveActivity).subscribeTasks).to.have.same.members(sendActivities);
            }
        ));

        it('should unsubscribe once the event has arrived, if preceding sends exists in all paths', 
            withElements(exclusiveChoreography, elements => {
                let activity = elements.get('Activity3');
                expect(findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([activity]);
            }
        ));

        it('should subscribe at deploy time when there is a path where no send is done before', 
            withElements(exclusiveChoreography, elements => {
                let activity = elements.get('Activity4');
                expect(findSubscriptionsFor(activity).subscribeTasks).to.have.same.members([DEPLOYMENT_TIME]);
            }
        ));

        it('should unsubscribe at undeploy time when there is a path where no send is done before', 
            withElements(exclusiveChoreography, elements => {
                let activity = elements.get('Activity4');
                expect(findSubscriptionsFor(activity).unsubscribeTasks).to.have.same.members([UNDEPLOYMENT_TIME]);
            }
        ));

        it('should unsubscribe in other branch, as soon as an event indicates that the other branch has been chosen', 
            withElements(unsubscribeChoreography, elements => {
                let receiveActivity = elements.get('Activity2');
                let concurrentActivity = elements.get('Activity1');
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([receiveActivity, concurrentActivity]);
            }
        ));

        it('should unsubscribe at undeployment, if there is a path where no event indicates that another branch has been chosen', 
            withElements(unsubscribeChoreography, elements => {
                let receiveActivity = elements.get('Activity1');
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([UNDEPLOYMENT_TIME]);
            }
        ));
        
        it('should unsubscribe in a following task, as soon as an event indicates that another branch has been chosen', 
            withElements(complexChoreography, elements => {
                let receiveActivity = elements.get('Activity2a');
                let concurrentActivity = elements.get('Activity2b');
                let followingActivity = elements.get('Activity3');
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([receiveActivity, concurrentActivity, followingActivity]);
            }
        ));

        it('should unsubscribe in a following task, as soon as an event indicates that another branch has been chosen, even when one alternative is empty', 
            withElements(emptyAlternativeChoreography, elements => {
                let receiveActivity = elements.get('Activity1');
                let followingActivity = elements.get('Activity2');
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([receiveActivity, followingActivity]);
            }
        ));
    });


    describe('regression of', function () {
        it('subscription with exclusive gateways in and before parallel', 
            withElements(complexChoreography, elements => {
                let receiveActivity = elements.get('Activity3');
                let sendActivities = [elements.get('Activity1a'), elements.get('Activity1b')];
                expect(findSubscriptionsFor(receiveActivity).subscribeTasks).to.have.same.members(sendActivities);
            }
        ));

        it('subscription over multiple differently typed gateways', 
            withElements(complexChoreography, elements => {
                let receiveActivity = elements.get('Activity4');
                let sendActivities = [elements.get('Activity0a'), elements.get('Activity0b')];
                expect(findSubscriptionsFor(receiveActivity).subscribeTasks).to.have.same.members(sendActivities);
            }
        ));

        it('when subscribe already is on one alternative, no unsubscribe is needed on the other one', 
            withElements(exclusiveRegressionChoreography, elements => {
                let receiveActivity = elements.get('Activity1b');
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([receiveActivity]);
            }
        ));

        it('duplicate unsubscribe in alternative sequence', 
            withElements(exclusiveRegressionChoreography, elements => {
                let receiveActivity = elements.get('Activity2b');
                let concurrentActivity = elements.get('Activity1a');
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([receiveActivity, concurrentActivity]);
            }
        ));

        it('duplicate unsubscribe in alternative nested exclusive gateway', 
            withElements(nestedExclusiveChoreography, elements => {
                let receiveActivity = elements.get('Activity1');
                let concurrentActivities = [elements.get('Activity2a'), elements.get('Activity2b')];
                expect(findSubscriptionsFor(receiveActivity).unsubscribeTasks).to.have.same.members([receiveActivity].concat(concurrentActivities));
            }
        ));

        it('unnecessary subscribe in one gateway alternative, when there is already a subscribe before the split', 
            withElements(multipleExclusiveChoreography, elements => {
                let receiveActivity = elements.get('Activity2');
                let subscribeActivities = [elements.get('Activity0a'), elements.get('Activity0b')];
                expect(findSubscriptionsFor(receiveActivity).subscribeTasks).to.have.same.members(subscribeActivities);
            }
        ));
    });

});
