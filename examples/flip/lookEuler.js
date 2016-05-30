/*global PIXI */

// create a renderer instance.
var renderer = new PIXI.WebGLRenderer(800, 600, {resolution: 1 });

// create a new loader
loader = new PIXI.loaders.Loader();
loader.add('spriteSheet', '_assets2/dudes/SpriteSheet.json');
loader.add('back', '_assets2/flip/back2.png');
loader.add('pixie', '_assets/spine/Pixie.json');
// use callback
//    loader.onComplete = onAssetsLoaded

//begin load
loader.load(onAssetsLoaded);

// holder to store aliens
var aliens = [];
var alienFrames = ["eggHead.png", "flowerTop.png", "helmlok.png", "skully.png"];

var count = 0;

// create an new instance of a pixi stage
var stage = new PIXI.Container();

// add the renderer view element to the DOM
document.body.appendChild(renderer.view);

// create an empty container
var camera = new PIXI.Camera3d();
stage.addChild(camera);

var alienContainer = new PIXI.Container3d();
var earthContainer = new PIXI.Container3d();
camera.addChild(earthContainer);
camera.addChild(alienContainer);
camera.boundsCullingContainer = alienContainer;
var debugGraphics = new PIXI.Graphics();
stage.addChild(debugGraphics);

camera.onZOrder = function(alien) {
    if (alien.nosort) {
        return;
    }
    var p = alien.updateProjectedTransform().matrix3d;
    alien.zOrder = p[14] / p[15];
};
camera.enableBoundsCulling = true;
camera.enableDisplayList = true;

function spawnAlien(d) {
    if (d < 4) {
        var frameName = alienFrames[d];
        //if you want to use 3d transform for object, either create Sprite3d/Container3d
        var sprite1 = PIXI.Sprite3d.fromFrame(frameName);
        sprite1.anchor.x = 0.5;
        sprite1.anchor.y = 1.0;
		//Be very careful with set(0.5, 0.5) or set(0.5) because Z axis WONT be changed that way.
		//use set(0.5, 0.5, 0.5) if you really want to set scale on Z axis too
		sprite1.scale.set(0.5);
    } else {
        var sprite1 = new PIXI.spine.Spine(loader.resources.pixie.spineData);
		//either upgrade container to container3d!
		sprite1.transform = new PIXI.Transform3d();
        sprite1.scale.x = sprite1.scale.y = sprite1.scale.z = 0.1;
        sprite1.state.setAnimationByName(0, "running", true);
        //sprite1.alpha = 0.5;
    }
    //Sprite belongs to plane, and plane is vertical in world coordinates.
    var spritePlane = new PIXI.Container3d();
    spritePlane.alwaysFront = true;
    spritePlane.addChild(sprite1);
    spritePlane.zIndex = 1;
    spritePlane.interactive = true;
    return spritePlane;
}

// var filter = new PIXI.filters.GrayFilter();
// var filter = new PIXI.filters.OutlineFilter(renderer.width, renderer.height, 10, 0xffffff);
var filter = new PIXI.filters.BlurFilter();
filter.blur = 2;

function onAssetsLoaded() {
    var earth = new PIXI.Sprite3d(loader.resources.back.texture);
	//because earth is Sprite3d, we can access its euler angles
    earth.euler.x = Math.PI / 2;
    earth.anchor.x = earth.anchor.y = 0.5;
    earthContainer.addChild(earth);

    earthContainer.nosort = true;
    earthContainer.zIndex = 0;

    for (var i = 0; i < 30; i++) {
        var d = Math.random() * 6 | 0;

        var spritePlane = spawnAlien(d);
        spritePlane.position.x = (Math.random() * 2 - 1) * 500.0;
        spritePlane.position.z = (Math.random() * 2 - 1) * 500.0;

        alienContainer.addChild(spritePlane);
    }

    earthContainer.interactive = true;
    earthContainer.on('click', function (event) {
        var p = new PIXI.Point();
        event.data.getLocalPosition(earth, p, event.data.global);
        var sp = spawnAlien(4);
        sp.position.x = p.x;
        sp.position.z = p.y;
        alienContainer.addChild(sp);
    });

    // start animating
    requestAnimationFrame(animate);
}

var ang = 0;

function animate() {
    camera.easyPerspective(renderer, 1000, 10, 10000);

    count += 0.04;

    debugGraphics.clear();
    debugGraphics.lineStyle(2, 0xffffff, 1.0);
    alienContainer.children.forEach(function (alien) {
        var rect = alien.getBounds();
        if (rect !== PIXI.Rectangle.EMPTY)
            debugGraphics.drawShape(rect);
        if (alien._over) {
            alien.filters = [filter];
        } else {
            alien.filters = null;
        }

    });

    ang += 0.01;
    camera.lookEuler.y = -ang;
    camera.lookEuler.x = Math.PI / 6;

    alienContainer.children.forEach(function (plane) {
        if (plane.alwaysFront) {
            //1. rotate sprite plane to the camera
			
			//Spine object dont have 'euler' in them, but we upgraded their transform and can access it directly
            plane.children[0].transform.euler.x = -Math.PI/6;
            //2. rotate sprite to the camera
            plane.euler.y = ang;
        }
    });

    // render the stage
    renderer.render(stage);

    requestAnimationFrame(animate);
}
    