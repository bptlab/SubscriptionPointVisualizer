import { isChoreography } from "./Utils";

export const DEPLOYMENT_TIME = {id : 'deploy'};
export const UNDEPLOYMENT_TIME = {id : 'undeploy'};

export default function SubscriptionFinder() {

}

SubscriptionFinder.prototype.findSubscriptionsFor = function(task) {
    let receiver = getParticipants(task).receiver;
    console.log(getParticipants(task));
    let before = search(task, incoming, each => isChoreography(each) && getParticipants(each).initiator === receiver);
    let after = search(task, outgoing, isChoreography);
    let subscribe = before[0] || DEPLOYMENT_TIME;
    let unsubscribe = subscribe !== DEPLOYMENT_TIME ? task : UNDEPLOYMENT_TIME;
    return new Subscription(subscribe, unsubscribe);
}

/**
 * At deployment time, subscribe to all events you may receive before sending any message yourself
 * @param {*} task 
 */
SubscriptionFinder.prototype.rule1 = function(task) {
    //TODO
    return false;
}

/**
 * Before sending a message, subscribe to all events you may receive before sending the next message
 */
SubscriptionFinder.prototype.rule2 = function(task) {

}

SubscriptionFinder.prototype.rule3 = function(task) {

}

SubscriptionFinder.prototype.rule4 = function(task) {

}

function Subscription(subscribeTasks, unsubscribeTasks) {
    if(!Array.isArray(subscribeTasks))subscribeTasks = [subscribeTasks];
    if(!Array.isArray(unsubscribeTasks))unsubscribeTasks = [unsubscribeTasks];
    this.subscribeTasks = subscribeTasks;
    this.unsubscribeTasks = unsubscribeTasks;
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