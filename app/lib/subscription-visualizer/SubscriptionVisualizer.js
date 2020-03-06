export default function SubscriptionVisualizer(viewer) {
    this.overlays = viewer.get('overlays');
    this.elementRegistry = viewer.get('elementRegistry');
    viewer.on('element.click', event => this.selected(event.element));
    this.selectedElement = undefined;
    this.overlayIds = [];
}

SubscriptionVisualizer.prototype.showSome = function() {
    this.showFor('ChoreographyTask_1m3qduh');
}

SubscriptionVisualizer.prototype.showFor = function(element) {
    const width = 5;
    if(!element) return;

    let html = 
        `<div class="highlight-overlay" style="background-color: #00FF55AA; width: ${width}px; height: ${element.height}px"></div>`

    let left = this.overlays.add(element, {
        position: {
        left: -width
        },
        html: marker(width, element.height, '#00FF55AA')
    });

    let right = this.overlays.add(element, {
        position: {
        right: 0
        },
        html: marker(width, element.height, '#FF2222AA')
    });
    this.selectedElement = element;
    this.overlayIds = [left, right];
}

SubscriptionVisualizer.prototype.hideOverlays = function() {
    this.overlayIds.forEach(each => this.overlays.remove(each));
    this.overlayIds = [];
    this.selectedElement = undefined;
}

SubscriptionVisualizer.prototype.selected = function(element) {
    let lastElement = this.selectedElement;
    this.hideOverlays();
    if(element != lastElement) {
        if(isChoreography(element)) {
            this.showFor(element);
        }
    }
}

function marker(width, height, color) {
    return `<div class="highlight-overlay" style="background-color: ${color}; width: ${width}px; height: ${height}px"></div>`   
}

function isChoreography(element) {
    return ['bpmn:ChoreographyTask', 'bpmn:SubChoreography', 'bpmn:CallChoreography'].includes(element.type);
}