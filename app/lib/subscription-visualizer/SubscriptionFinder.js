import { isChoreographyActivity, isChoreographyProcess, getParticipants } from "./Utils";

export const DEPLOYMENT_TIME = {id : 'deploy'};
export const UNDEPLOYMENT_TIME = {id : 'undeploy'};

export default function findSubscriptionsFor(task) {
    let finder = new SubscriptionFinder();
    return finder.findSubscriptionsFor(task);
}

function SubscriptionFinder() {

}

SubscriptionFinder.prototype.findSubscriptionsFor = function(task) {
    let receiver = getParticipants(task).receiver;
    let isPossibleUnsubscribe = candidate => {
        if(!isChoreographyActivity(candidate))return false;
        let participants = getParticipants(candidate)
        return participants.initiator === receiver || participants.receiver === receiver;
    }

    let subscribe;
    let unsubscribe;
    let incomingPaths = paths(task);
    subscribe = incomingPaths
        .map(each => each.filter(isChoreographyActivity))
        .map(each => each.filter(el => getParticipants(el).initiator === receiver))
        .map(each => each[each.length - 1]);
    if(subscribe.some(any => any === undefined)) {
        subscribe = DEPLOYMENT_TIME;
        unsubscribe = UNDEPLOYMENT_TIME;
    } else {
        let allPaths = subscribe
            .map(each => paths(each, 'outgoing'))
            .flat();
        unsubscribe = allPaths
            .map(path => path
                .filter(isPossibleUnsubscribe)
                //Unsubscription is only save if we know that the selected task cannot occur anymore. 
                //The selected task cannot occur anymore if the possible unsubscribe either always happens after it, or implies that another alternative has been chosen
                .filter(each => canReach(task, each) || allPaths.every(p => !p.includes(each) || !p.includes(task))))
            .map(path => path[path.length - 1]);

        if(unsubscribe.every(each => each !== undefined)) {
            unsubscribe.push(task);
        } else {
            unsubscribe = UNDEPLOYMENT_TIME;
        }
    } 
    return new Subscription(subscribe, unsubscribe);
}

function Subscription(subscribeTasks, unsubscribeTasks) {
    let isIterable = obj =>  obj != null && typeof obj[Symbol.iterator] === 'function';
    if(!isIterable(subscribeTasks))subscribeTasks = [subscribeTasks];
    if(!isIterable(unsubscribeTasks))unsubscribeTasks = [unsubscribeTasks];
    this.subscribeTasks = removeDuplicates(subscribeTasks);
    this.unsubscribeTasks = removeDuplicates(unsubscribeTasks);
}

/**
 * Returns an array of paths, where a path itself is an array of elements 
 */
function paths(element, direction) {
    if(!direction) direction = 'incoming';
    const flowDirection = direction === 'incoming' ? 'source' : 'target';
    let incomingFlows = element[direction];
    let incomingPaths = incomingFlows
        .map(each => each[flowDirection])
        .map(each => paths(each, direction));
    if(element.type === "bpmn:ExclusiveGateway") {
        incomingPaths = [].concat(...incomingPaths);
    } else if(element.type === "bpmn:ParallelGateway") {
        while(incomingPaths.length > 1) {
            let joinedPaths = [];
            incomingPaths[0].forEach(first => 
                incomingPaths[1].forEach(second => {
                    let joinedPath = join(first, second);
                    if(joinedPath)joinedPaths.push(joinedPath);
                }));
            incomingPaths.shift();
            incomingPaths[0] = joinedPaths;
        }
        incomingPaths = incomingPaths[0];
    } else {
        incomingPaths = [].concat(...incomingPaths);
    }
    if(incomingPaths.length === 0) incomingPaths = [[]];
    incomingPaths.forEach(each => each.push(element));
    return incomingPaths;
}

/**
 * At a parallel join, 
 * paths come from different incoming sequence flows
 * the paths of two incoming directions can be joined
 * if and only if they have an identical start and then do have no task in common
 * this is correct because if they have a task in common after the first sequence of different tasks, this means that 
 *  an exclusive join occured before and the paths to be joined chose different paths incoming to this gateway
 *      => Then there exists a path that has chosen the same path at this exclusive gateway that will be joined
 */
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
    if(!(i === maxLength)) return undefined;//Not joinable
    return result;
}

function findNext(task, filter) {
    if(filter(task))return task;
    const direction = 'outgoing';
    const flowDirection = 'target';
    let interfaze = [task];
    let visited = new Set([task]);
    while(interfaze.length > 0) {
        let current = interfaze.shift();
        let next = current[direction];
        let found = next
            .map(each => each[flowDirection])
            .find(each => {
                if(!visited.has(each)) {
                    interfaze.push(each);
                    visited.add(each);
                    return filter(each);
                }
                return false;
            });
        if(found) return found;
    }
}

function canReach(taskA, taskB) {
    return findNext(taskA, each => each === taskB) !== undefined;
}


function parentProcess(element) {
    return isChoreographyProcess(element) ? element : parentProcess(element.parent);
}

function endEvents(process) {
    return process.children.filter(each => each.type === 'bpmn:EndEvent')
}

function choreographies(process) {
    return process.children.filter(isChoreographyActivity);
}

function removeDuplicates(arr) {
    return [...new Set(arr)];
}