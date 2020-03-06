import { isChoreography } from "./Utils";

export default function SubscriptionFinder() {

}

SubscriptionFinder.prototype.findSubscriptionsFor = function(task, participant) {
    console.log(getParticipants(task));
    let before = search(task, incoming, each => isChoreography(each));
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

/**
 * At deployment time, subscribe to all events you may receive before sending any message yourself
 * @param {*} task 
 */
SubscriptionFinder.prototype.rule1 = function(task) {
    //TODO
}

/**
 * Before sending a message, subscribe to all events you may receive before sending the next message
 */
SubscriptionFinder.prototype.rule2 = function(task) {

}



function getParticipants(task) {
    let initiator = task.businessObject.get('initiatingParticipantRef').id;
    let refs = task.businessObject.get('participantRef');
    if(refs[0].id === initiator) {
        return {
            initiator : refs[0],
            receiver : refs[1]
        }
    } else if(refs[1].id === initiator) {
        return {
            initiator : refs[1],
            receiver : refs[0]
        }
    } else return undefined;
}