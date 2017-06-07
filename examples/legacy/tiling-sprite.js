
var renderer = PIXI.autoDetectRenderer(800, 600);
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

// create a texture from an image path
var texture = PIXI.Texture.fromImage('_assets/p2.jpeg');

/* create a tiling sprite ...
 * requires a texture, a width and a height
 * in WebGL the image size should preferably be a power of two
 */
var tilingSprite = new PIXI.extras.TilingSprite(texture, renderer.width, renderer.height);
stage.addChild(tilingSprite);

tilingSprite.tilePosition.set(400, 300);

var count = 0;
var cnt = 0;

animate();

function animate() {
    cnt = (cnt+1)%40;
    if (texture.valid) {
        var offset = Math.min(cnt, 40-cnt);
        texture.orig = new PIXI.Rectangle(0, 0, 128, 128);
        texture.frame = new PIXI.Rectangle(offset, offset, 128-2*offset, 128-2*offset);
        texture.trim = new PIXI.Rectangle(offset, offset, 128-2*offset, 128-2*offset);
        set = true;
    }

    count += 0.001;
    tilingSprite.tileTransform.rotation = count;

    tilingSprite.tileScale.x = 2 + Math.sin(count);
    tilingSprite.tileScale.y = 2 + Math.cos(count);

    tilingSprite.tileTransform.pivot.x += 1;
    tilingSprite.tileTransform.pivot.y += 1;

    // render the root container
    renderer.render(stage);

    requestAnimationFrame(animate);
}