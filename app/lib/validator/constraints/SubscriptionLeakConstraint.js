import findSubscriptionsFor, { DEPLOYMENT_TIME, UNDEPLOYMENT_TIME } from '../../subscription-visualizer/SubscriptionFinder';
import { isChoreographyActivity, getParticipants } from '../../subscription-visualizer/Utils';


export default function subscriptionLeakConstraint(shape, reporter) {
    if(isChoreographyActivity(shape)) {
        let subscription = findSubscriptionsFor(shape);
        if(subscription.unsubscribeTasks.length == 1 && subscription.unsubscribeTasks[0] === UNDEPLOYMENT_TIME && !(subscription.subscribeTasks.length === 1 && subscription.subscribeTasks[0] === DEPLOYMENT_TIME)) {
            let participants = getParticipants(shape);
            reporter.warn(shape, `Subscription leak: Participant "${participants.receiver.name}" subscribes to this task at runtime, but cannot unsubscribe before undeployment time`);
        }
    }
}