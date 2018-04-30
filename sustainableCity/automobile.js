var autos = [],
    roads = [];

const DIRECTION = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3,

    LEFT: 0,
    AHEAD: 1,
    RIGHT: 2,
    ROTATE180: 3
};

var expectedUpdates = 100;
class Auto {
    constructor(position, destination, obj3d) {
        this.position = position;
        this.destination = destination;
        this.obj = obj3d;

        this.gapVisualUpdate = 0;
    }

    getOffset() {
        var distX = this.destination.x - this.position.x;
        var distY = this.destination.y - this.position.y;

        return new THREE.Vector2((distX / expectedUpdates) * this.gapVisualUpdate * 15, (distY / expectedUpdates) * this.gapVisualUpdate * 15);
    }

    getRoadOffset() {
        var direction = getDirectionTo(this.position, this.destination);

        var offset = 0;
        switch (direction) {
            case 0:
                offset = 1;
                break;
            case 1:
                offset = -1;
                break;
            case 2:
                offset = -1;
                break;
            case 3:
                offset = 1;
        }

        var vec = new THREE.Vector2();
        if (direction.mod(2) == 0)
            vec.x = offset;
        else 
            vec.y = offset;
        return vec
    }

    onRoad(road) {
        return this.position == road;
    }

    updateVisuals() {
        var offset = this.getOffset().add(this.getRoadOffset());

        this.obj.position.set((this.position.y * 15) + offset.y, 0.16, (this.position.x * 15) + offset.x);

        this.obj.rotation.set(0, this.getRotation(), 0)
    }

    getRotation() {
        var direction = getDirectionTo(this.position, this.destination);
        if (direction.mod(2) == 0)
            direction = (direction + 2).mod(4);
        return direction  * Math.PI / 2;
    }

    updateOffsetVisuals() {
        this.gapVisualUpdate += 1;
        this.updateVisuals();
    }

    addToScene() {
        scene.add(this.obj);
    }

    update() {
        var newPos = this.destination.clone();
        this.destination = pickDestination(newPos, this.position);
        this.position = newPos;

        this.gapVisualUpdate = 0;
        
        this.updateVisuals();
    }
}

function pickRoad() {
    var potential = [];
    for (var i = 0; i < roads.length; i++) {
        var found = false;

        for (var a = 0; a < autos.length; a++) {
            if (autos[a].onRoad(roads[i])) {
                found = true;
                break;
            }
        }

        if (!found) {
            potential.push(roads[i]);
        }
    }

    return potential[parseInt(Math.random() * (potential.length-1))];
}

function findRoadAt(x, y) {
    for (var i = 0; i < roads.length; i++) {
        if (roads[i].x == x && roads[i].y == y) return roads[i];
    }
    return null;
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getSurrounding(road) {
    var potential1 = [];
    
    potential.push(findRoadAt(road.x, road.y + 1));
    potential.push(findRoadAt(road.x, road.y - 1));
    potential.push(findRoadAt(road.x + 1, road.y));
    potential.push(findRoadAt(road.x - 1, road.y));

    var potential = [];
    for (var i = 0; i < potential1.length; i++) {
        if (potential1[i] != null) potential.push(potential1[i]);
    }

    return potential;
}

function nextTo(road, NESWdirection) {
    switch (NESWdirection) {
        case 0:
            return findRoadAt(road.x, road.y + 1);
        case 1:
            return findRoadAt(road.x + 1, road.y)
        case 2:
            return findRoadAt(road.x, road.y - 1)
        case 3:
            return findRoadAt(road.x - 1, road.y)
    }
}

function getDirectionTo(from, to) {
    if (from.x == to.x) {
        if (from.y == to.y + 1)
            return DIRECTION.NORTH;
        return DIRECTION.SOUTH;
    }

    if (from.x == to.x + 1)
        return DIRECTION.EAST;
    return DIRECTION.WEST;
}

function pickDestination(road, lastPosition) {
    var directions = [DIRECTION.NORTH, DIRECTION.EAST, DIRECTION.SOUTH, DIRECTION.WEST];
    shuffle(directions);

    for (var i = 0; i < directions.length; i++) {
        var next = nextTo(road, directions[i]);
        if (next != null) {
            if (lastPosition != null && next.x == lastPosition.x && next.y == lastPosition.y) continue;
            return next;
        }
    }
    return lastPosition;
}

function createAutos(path, count) {
    loadObj('models/' + path + '.json', null, null, function(obj) {
        for (var i = 0; i < count; i++) {
            var road = pickRoad();
            var auto = new Auto(road, pickDestination(road), obj.clone());
            autos.push(auto);
            auto.updateVisuals();
            auto.addToScene();
        }
    });
}

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};