# SubscriptionPointVisualizer ![Build](https://github.com/bptlab/subscription-point-visualizer/workflows/Node.js%20CI/badge.svg)
Visualizes subscription points in bpmn choreography diagrams.
![Screenshot](https://user-images.githubusercontent.com/28008098/76978904-90b32a00-6937-11ea-8b22-a50307b21fa3.png)


## Usage

Node needs to be installed for the visualizer to run. To start it enter the following into your command line:
```shell
npm install
npm run build
npm run serve
```

The visualizer is then served to `http://localhost:9024`.

Click on a choreography task to see the subscription points (green) and unsubscription points (red). If the indicator is placed at the border of the whole process, (un-)deployment time (un-)subscription is indicated.

#

This repository is based on [chor-js](https://github.com/bptlab/chor-js)
