import SubscriptionFinder from "./SubscriptionFinder";
import { isChoreography } from "./Utils";

export default function SubscriptionVisualizer(viewer) {
    this.subscriptionFinder = new SubscriptionFinder(viewer);
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
    if(!element) return;
    const width = 5;
    let subscription = this.subscriptionFinder.findSubscriptionsFor(element);

    let left = subscription.subscribeTasks.map(each => 
        this.overlays.add(each, {
            position: {left: -width},
            html: marker(width, element.height, '#00FF55AA')
        })
    );

    let right = subscription.unsubscribeTasks.map(each =>
        this.overlays.add(each, {
            position: {right: 0},
            html: marker(width, element.height, '#FF2222AA')
        })
    );
    this.selectedElement = element;
    this.overlayIds = left.concat(right);
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