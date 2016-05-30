var renderer = new PIXI.CanvasRenderer(800, 600,{backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

// create the root of the scene graph
var camera = new PIXI.Camera2d();
camera.enableDisplayList = true;

// basic culling, it is slow, but who the hell cares
camera.enableBoundsCulling = true;

// Z-order is calculated for ALL elements that were not culled and have set zIndex
// When camera sorts stuff, Z-index, Z-order, then update order
camera.onZOrder = function(sprite) {
	if (sprite.zIndex == 0) {
		//green bunnies go down
		sprite.zOrder = -sprite.position.y;
	} else {
		//blue bunnies go up
		sprite.zOrder = +sprite.position.y;
	}
};

// create a texture from an image path
var texture_green = PIXI.Texture.fromImage('_assets2/bunnies/square_green.png');
var texture_blue = PIXI.Texture.fromImage('_assets2/bunnies/square_blue.png');

function resize(event) {
    var target = event.target;
    target.scale.x = 2.5 - target.scale.x;
    target.scale.y = 2.5 - target.scale.y;
}

var bunniesOdd = new PIXI.Container();
var bunniesEven = new PIXI.Container();
var bunniesBlue = new PIXI.Container();
camera.addChild(bunniesOdd);
camera.addChild(bunniesBlue);
camera.addChild(bunniesEven);

var ind = [];
for (var i=0;i<15;i++) {
    var bunny = new PIXI.Sprite(texture_green);
    bunny.size.set(50, 50);
    bunny.position.set(100+20*i, 100+20*i);
    bunny.anchor.set(0.5);
    // that thing is required
    bunny.zIndex = 0;
    bunny.interactive = true;
    bunny.on('click', resize);
    if (i%2==0) {
        bunniesEven.addChild(bunny);
    } else {
        bunniesOdd.addChild(bunny);
    }
}

for (var i=0;i<10;i++) {
    var bunny = new PIXI.Sprite(texture_blue);
    bunny.size.set(50, 50);
    bunny.position.set(400+20*i, 400-20*i);
    bunny.anchor.set(0.5);
	//blue over green!
    bunny.zIndex = 1;
    bunny.interactive = true;
    bunny.on('click', resize);
    bunniesBlue.addChild(bunny);
}

// start animating
animate();

function animate() {
    requestAnimationFrame(animate);
    // render the container
    renderer.render(camera);
}
