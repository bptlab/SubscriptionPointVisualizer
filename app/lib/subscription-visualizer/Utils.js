
export function isChoreographyActivity(element) {
    return ['bpmn:ChoreographyTask', 'bpmn:SubChoreography', 'bpmn:CallChoreography'].includes(element.type);
}

export function isChoreographyProcess(element) {
    return ['bpmn:SubChoreography', 'bpmn:Choreography'].includes(element.type)
}

export function getParticipants(task) {
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