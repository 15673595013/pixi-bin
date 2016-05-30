// create a renderer instance.
var renderer = new PIXI.WebGLRenderer(800, 600, {resolution:1});

// create a new loader
loader = new PIXI.loaders.Loader();
loader.add('spriteSheet', '_assets2/dudes/SpriteSheet.json');
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
camera.easyPerspective(renderer, 300, 10, 1000);

var alienContainer = new PIXI.Container3d();
//alienContainer.position.x = window.innerWidth/2;
//alienContainer.position.y = window.innerHeight/2;
alienContainer.position.z = 300;
camera.addChild(alienContainer);

var debugGraphics = new PIXI.Graphics();

stage.addChild(camera);
stage.addChild(debugGraphics);

function onAssetsLoaded()
{
    // add a bunch of aliens with textures from image paths
    for (var i = 0; i < 100; i++)
    {
        var frameName = alienFrames[i % 4];

        // create an alien using the frame name..
        var alien = PIXI.Sprite3d.fromFrame(frameName);

        alien.position.x = Math.random() * 600 - 300;
        alien.position.y = Math.random() * 600 - 300;
        alien.position.z = Math.random() * 600 - 300;
        alien.anchor.x = 0.5;
        alien.anchor.y = 0.5;
        alien.transform.euler.x  = Math.random() * 100;
        alien.transform.euler.y  = Math.random() * 100;
        alien.transform.euler.z  = Math.random() * 100;
        alien.zIndex = 0;
        aliens.push(alien);
        //  alien.position.z =  200;
        alienContainer.addChild(alien);
    }

    camera.onZOrder = function(alien) {
        var p = alien.updateProjectedTransform().matrix3d;
        alien.zOrder = p[14] / p[15];
    };
    camera.enableBoundsCulling = true;
    camera.enableDisplayList = true;

    // start animating
    requestAnimationFrame(animate);
}


function animate() {
    // just for fun, lets rotate mr rabbit a little
    debugGraphics.clear();
    for (var i = 0; i < aliens.length; i++)
    {
        var alien = aliens[i];
        if (alien.renderable) {
            var bounds = alien.getBounds();
            if (bounds !== PIXI.Rectangle.EMPTY) {
                debugGraphics.drawShape(alien.getBounds());
            }
        }
    }

    count += 0.01;
    // alienContainer.scale.x = Math.sin(count);
    // alienContainer.scale.y = Math.sin(count);

    alienContainer.transform.euler.x += 0.01;
    alienContainer.transform.euler.y += 0.01;

    // render the stage
    renderer.render(stage);
    requestAnimationFrame(animate);
}
    