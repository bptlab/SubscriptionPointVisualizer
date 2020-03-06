
export function isChoreography(element) {
    return ['bpmn:ChoreographyTask', 'bpmn:SubChoreography', 'bpmn:CallChoreography'].includes(element.type);
}