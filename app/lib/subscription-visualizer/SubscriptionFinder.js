import { isChoreography } from "./Utils";

export default function SubscriptionFinder(viewer) {
    
}

SubscriptionFinder.prototype.findSubscriptionsFor = function(task) {
    let before = search(task, incoming, isChoreography);
    let after = search(task, outgoing, isChoreography);
    return new Subscription(before[before.length - 1] || task, after[after.length - 1] || task);
}

function Subscription(subscribeTask, unsubscribeTask) {
    this.subscribeTask = subscribeTask;
    this.unsubscribeTask = unsubscribeTask;
}

const outgoing = 'outgoing';
const incoming = 'incoming';
function search(task, direction, filter) {
    if(direction !== incoming && direction !== outgoing)direction = outgoing;
    const flowDirection = direction === 'incoming' ? 'source' : 'target';
    let interfaze = [task];
    let result = [];
    let visited = new Set([task]);
    while(interfaze.length > 0) {
        let current = interfaze.shift();
        let next = current[direction];
        next.forEach(each => {
            let element = each[flowDirection];
            if(!visited.has(element)) {
                interfaze.push(element);
                if(filter === undefined || filter(element))result.push(element);
            }
        });
    }
    return result;
}
