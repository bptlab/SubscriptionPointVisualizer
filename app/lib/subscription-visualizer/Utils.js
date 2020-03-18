
export function isChoreographyActivity(element) {
    return ['bpmn:ChoreographyTask', 'bpmn:SubChoreography', 'bpmn:CallChoreography'].includes(element.type);
}

export function isChoreographyProcess(element) {
    return ['bpmn:SubChoreography', 'bpmn:Choreography'].includes(element.type)
}