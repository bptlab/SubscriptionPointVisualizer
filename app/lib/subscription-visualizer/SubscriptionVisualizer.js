import SubscriptionFinder, { DEPLOYMENT_TIME, UNDEPLOYMENT_TIME } from "./SubscriptionFinder";
import { isChoreography } from "./Utils";

export default function SubscriptionVisualizer(viewer) {
    this.viewer = viewer;
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

    let left = subscription.subscribeTasks.map(each => {
        if(each === DEPLOYMENT_TIME) each = this.processBounds();
        return this.overlays.add(each, {
            position: {left: -width},
            html: marker(width, each.height, '#00FF55AA')
        })
    });

    let right = subscription.unsubscribeTasks.map(each => {
        if(each === UNDEPLOYMENT_TIME) each = this.processBounds();
        return this.overlays.add(each, {
            position: {right: 0},
            html: marker(width, each.height, '#FF2222AA')
        })
    });
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

SubscriptionVisualizer.prototype.processBounds = function() {
    const padding = 5;
    let set = this.elementRegistry.getAll();
    let x = Math.min(...set.map(each => each.x || Infinity)) - padding;
    let y = Math.min(...set.map(each => each.y || Infinity));
    let width = Math.max(...set.map(each => (each.x + each.width) || -Infinity)) - x + padding;
    let height = Math.max(...set.map(each => (each.y + each.height) || -Infinity)) - y;
    let res = {id : '__processBounds', x, y, width, height};
    return res;
}

function marker(width, height, color) {
    return `<div class="highlight-overlay" style="background-color: ${color}; width: ${width}px; height: ${height}px"></div>`   
}