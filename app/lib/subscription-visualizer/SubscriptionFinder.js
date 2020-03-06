export default function SubscriptionFinder(viewer) {
    
}

SubscriptionFinder.prototype.findSubscriptionsFor = function(task) {

    return new Subscription(task, task);
}

function Subscription(subscribeTask, unsubscribeTask) {
    this.subscribeTask = subscribeTask;
    this.unsubscribeTask = unsubscribeTask;
}
