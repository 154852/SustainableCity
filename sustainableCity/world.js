var worldSize = [],
    clouds = [],
    boxSize = 8,
    world = {};

var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function createCloud(limit) {
    loadObj('models/cloud.json', null, null, function(obj) {
        var z = (Math.random() * (limit? 75:300)) - 150;
        obj.position.set((Math.random() * 300) - 75, (Math.random() * 20) + 20, z);
        scene.add(obj);
        clouds.push(obj);
    });
}

function loadWorld(path) {
    var req = new XMLHttpRequest();
    req.addEventListener('load', function() {
        var json = JSON.parse(this.responseText);
        world = json;
        worldSize = json.size;
        var lastRow = [];

        if (json.box)
            boxSize = json.box;

        if (getOption('autos')) {
            createAutos(json.autos.path, json.autos.count);
        }
            
        
        if (!json.hidegrid)
            for (var y = 0; y < Math.min(json.size[1], json.grid.length); y++) {
                var row = json.grid[y];
                if (row.clone)
                    row = lastRow;
                else lastRow = row
                for (var x = 0; x < Math.min(json.size[0], row.length); x++) {
                    var cell = row[x];
                    if (cell.road)
                        roads.push(new THREE.Vector2(x, y));
                    
                    if (!cell.path) continue;

                    var path = 'models/' + cell.path + '.json',
                        rotation = cell.rotation? cell.rotation:[0, 0, 0];
                    rotation = new THREE.Vector3(rotation[0] * Math.PI, rotation[1] * Math.PI, rotation[2] * Math.PI);
                    var pos = new THREE.Vector3(y * boxSize, 0, x * boxSize);

                    if (cell.animated) {
                        loadAnimated(path, pos, rotation);
                    } else {
                        loadObj(path, pos, rotation);
                    }
                }
            }
        
        if (getOption('light'))
            light.position.set(70, 40, 150);

        if (getOption('text')) {
            var loader = new THREE.FontLoader();
            loader.load('https://threejs.org//examples/fonts/helvetiker_regular.typeface.json', function (font) {
                for (var i = 0; i < json.info.length; i++) {
                    var el = json.info[i];

                    var geometry = new THREE.TextGeometry(el.title.text, {
                        font: font,
                        size: 1,
                        height: 0.25,
                        curveSegments: 12,
                        bevelEnabled: false
                    });

                    var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
                    var text = new THREE.Mesh( geometry, material );
                    text.position.set(el.title.position[0], el.title.position[1], el.title.position[2]);
                    text.rotation.set(el.title.rotation[0], el.title.rotation[1], el.title.rotation[2]);
                    scene.add(text);

                    var geometry = new THREE.TextGeometry(el.body.text, {
                        font: font,
                        size: 0.5,
                        height: 0.1,
                        curveSegments: 12,
                        bevelEnabled: false
                    });

                    var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
                    var text = new THREE.Mesh( geometry, material );
                    text.position.set(el.body.position[0], el.body.position[1], el.body.position[2]);
                    text.rotation.set(el.body.rotation[0], el.body.rotation[1], el.body.rotation[2]);
                    scene.add(text);
                }
            });
        }

        var geometry1 = new THREE.PlaneGeometry((worldSize[1] * boxSize) + 10, (worldSize[0] * boxSize) + 10);
        var material1 = new THREE.MeshBasicMaterial( {color: 0x1b602c, side: THREE.FrontSide} );
        var base1 = new THREE.Mesh( geometry1, material1 );
        base1.rotation.x = -Math.PI /2;
        base1.position.set((worldSize[1] / 2 * boxSize) - (boxSize / 2), -0.02, (worldSize[0] / 2 * boxSize) - (boxSize / 2));
        scene.add(base1);

        var geometry2 = new THREE.PlaneGeometry(1500, 1500);
        var material2 = new THREE.MeshPhongMaterial( {
            color: 0xffffff,
            emissive: 0x197b96,
            side: THREE.DoubleSide,
            flatShading: true
        } );
        material2.roughness = 0.5;
        material2.metalness = 0.5;
        material2.flatShading = true;
        var base2 = new THREE.Mesh( geometry2, material2 );
        base2.rotation.x = -Math.PI / 2;
        base2.position.set((worldSize[1] / 2 * boxSize) - (boxSize / 2), -0.05, (worldSize[0] / 2 * boxSize) - (boxSize / 2));
        scene.add(base2);

        var geometry3 = new THREE.PlaneGeometry((worldSize[1] * boxSize) + 10, json.beach);
        var material3 = new THREE.MeshBasicMaterial( {color: 0xF4D03F, side: THREE.FrontSide} );
        var base3 = new THREE.Mesh( geometry3, material3 );
        base3.rotation.x = -Math.PI /2;
        base3.position.set((worldSize[1] / 2 * boxSize) - (boxSize / 2), -0.01, (worldSize[0] * boxSize) - (json.beach / 2));
        scene.add(base3);

        for (var i = 0; i < json.extras.length; i++) {
            var pos = new THREE.Vector3(json.extras[i].position[0], json.extras[i].position[1], json.extras[i].position[2]);
            var rot = new THREE.Vector3(json.extras[i].rotation[0], json.extras[i].rotation[1], json.extras[i].rotation[2]);
            loadObj('models/' + json.extras[i].path + '.json', pos, rot);
        }

        controls.target = new THREE.Vector3(worldSize[1]*15/2, 0, worldSize[0]*15/2);
        camera.position.set(-20, 77, 63);
        console.log(controls.target);
        controls.update();
    });
    req.open('GET', 'worlds/w' + path + '.json');
    req.send();
}

loadWorld(2);

var windSpeed = ((Math.random() * 0.05) + 0.025) / 15;
var updateI = 0;

var betweenAutoUpdate = 100,
    betweenGraphicalAutoUpdate = 100 / expectedUpdates;

function update() {   
    updateI += 1;
    // console.log(updateI);

    if (getOption('autos'))
        if (updateI % betweenAutoUpdate == 0) {
            for (var i = 0; i < autos.length; i++) {
                autos[i].update();
            }
        } else {
            for (var i = 0; i < autos.length; i++) {
                autos[i].updateOffsetVisuals();
            }
        }
    
    if (getOption('clouds')) {
        for (var i = 0; i < clouds.length; i++) {
            if (clouds[i].position.z > 150) {
                scene.children.splice(scene.children.indexOf(clouds[i]), 1);
                clouds.splice(i, 1);
                createCloud(true);
            } else
                clouds[i].position.z += clouds[i].position.y * windSpeed;
        }
    }
    requestAnimationFrame(update);
}

if (getOption('clouds')) {
    for (var i = 0; i < parseInt(Math.random() * 20) + 20; i++) {
        createCloud(false);
    }
}

function renderLoop() {
    controls.update();
    
    render(getOption('animations'));
    requestAnimationFrame(renderLoop);
}

renderLoop();
update();