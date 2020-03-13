import { isChoreography } from "./Utils";

export const DEPLOYMENT_TIME = {id : 'deploy'};
export const UNDEPLOYMENT_TIME = {id : 'undeploy'};

export default function SubscriptionFinder() {

}

SubscriptionFinder.prototype.findSubscriptionsFor = function(task) {
    let receiver = getParticipants(task).receiver;
    let subscribe;
    let unsubscribe;
    let incomingPaths = paths(task);
    subscribe = incomingPaths
        .map(each => each.filter(el => getParticipants(el).initiator === receiver))
        .map(each => each[each.length - 1]);
    if(subscribe.some(any => any === undefined)) {
        subscribe = DEPLOYMENT_TIME;
        unsubscribe = UNDEPLOYMENT_TIME;
    } else {
        unsubscribe = task;
    } 
    return new Subscription(subscribe, unsubscribe);
}

function Subscription(subscribeTasks, unsubscribeTasks) {
    if(!Array.isArray(subscribeTasks))subscribeTasks = [subscribeTasks];
    if(!Array.isArray(unsubscribeTasks))unsubscribeTasks = [unsubscribeTasks];
    this.subscribeTasks = subscribeTasks;
    this.unsubscribeTasks = unsubscribeTasks;
}

/**
 * Returns an array of paths, where a path itself is an array of elements 
 */
function paths(element) {
    const direction = 'incoming';
    const flowDirection = 'source';
    let incomingFlows = element[direction];
    let incomingPaths = incomingFlows
        .map(each => each[flowDirection])
        .map(each => paths(each));
    if(element.type === "bpmn:ExclusiveGateway") {
        incomingPaths = [].concat(...incomingPaths);
    } else if(element.type === "bpmn:ParallelGateway") {
        while(incomingPaths.length > 1) {
            let joinedPaths = [];
            incomingPaths[0].forEach(first => 
                incomingPaths[1].forEach(second => 
                    joinedPaths.push(join(first, second))));
            incomingPaths.shift();
            incomingPaths[0] = joinedPaths;
        }
        incomingPaths = incomingPaths[0];
    } else {
        incomingPaths = [].concat(...incomingPaths);
    }
    if(incomingPaths.length === 0) incomingPaths = [[]];
    if(isChoreography(element)) incomingPaths.forEach(each => each.push(element));
    return incomingPaths;
}

function join(path1, path2) {
    const minLength = Math.min(path1.length, path2.length);
    const maxLength = Math.max(path1.length, path2.length);
    let result = [];
    let i = 0;
    for(; i < minLength && path1[i] === path2[i]; i++) {
        result.push(path1[i]);
    }
    for(; i < maxLength && path1[i] !== path2[i]; i++) {
        if(i < path1.length) result.push(path1[i]);
        if(i < path2.length) result.push(path2[i]);
    }
    if(!(i === maxLength))throw "Violated assumption";
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