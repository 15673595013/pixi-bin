/*global PIXI */
'use strict';

var renderer = new PIXI.WebGLRenderer(800, 600, {resolution: 1, antialias: true });
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();

var camera = new PIXI.Camera3d();
camera.easyPerspective(renderer, 350, 30, 10000);
camera.lookEuler.x = Math.PI / 5.5;
stage.addChild(camera);

var cards = new PIXI.Container3d();
cards.position.y = -50;
// MAKE CARDS LARGER:
cards.scale.set(1.5,1.5,1.5);
camera.addChild(cards);

// create a new loader
var loader = new PIXI.loaders.Loader();
loader.add('cards', '_assets2/casino/cards.json');
loader.add('table', '_assets2/casino/table.jpg');
loader.load(onAssetsLoaded);

//its for Z-index
camera.enableDisplayList = true;
camera.onZOrder = function(item) {
    item.zOrder = item.position.z;
    if (item.zIndex == 2) {
        //its inner card, and since all matrices are calculated at the point of sorting
        // we can check which side is actually visible
        // if we do that in update(), it will be slower by 1 frame
        item.parent.checkFace();
    }
};

var blurFilter = new PIXI.filters.BlurFilter();
blurFilter.blur = 0.2;


function CardSprite() {
    PIXI.Container3d.call(this);
    let tex = loader.resources['cards'].textures;

    //shadow will be under card
    this.shadow = new PIXI.Sprite3d(tex["black.png"]);
    this.shadow.anchor.set(0.5);
    this.shadow.scale.set(0.98);
    this.shadow.alpha = 0.7;
    //TRY IT WITH FILTER:
    this.shadow.filters = [blurFilter];
    //all shadows are UNDER all cards
    this.shadow.zIndex = 1;
    this.inner = new PIXI.Container3d();
    //cards are above the shadows
    //either they have back, either face
    this.inner.zIndex = 2;

    this.addChild(this.shadow);
    this.addChild(this.inner);

    //construct "inner" from back and face
    this.back = new PIXI.Sprite3d(tex["cover1.png"]);
    this.back.anchor.set(0.5);
    this.face = new PIXI.Container3d();
    this.inner.addChild(this.back);
    this.inner.addChild(this.face);
    this.code = 0;
    this.showCode = -1;
    this.inner.euler.y = Math.PI;
    this.scale.set(0.2, 0.2, 0.2);

    //construct "face" from four sprites
    this.createFace();
}

CardSprite.prototype = Object.create(PIXI.Container3d.prototype);

CardSprite.prototype.createFace = function() {
    var face = this.face;
    face.removeChildren();
    var tex = loader.resources['cards'].textures;
    var sprite = new PIXI.Sprite3d(tex['white1.png']);
    var sprite2 = new PIXI.Sprite3d(PIXI.Texture.EMPTY);
    var sprite3 = new PIXI.Sprite3d(PIXI.Texture.EMPTY);
    var sprite4 = new PIXI.Sprite3d(PIXI.Texture.EMPTY);
    sprite2.y = -120;
    sprite2.x = -80;
    sprite3.y = 70;
    sprite3.x = 40;
    sprite4.y = -70;
    sprite4.x = -100;

    sprite.anchor.set(0.5);
    sprite2.anchor.set(0.5);
    sprite3.anchor.set(0.5);
    face.addChild(sprite);
    face.addChild(sprite2);
    face.addChild(sprite3);
    face.addChild(sprite4);

    this.updateFace();
};

CardSprite.prototype.updateFace = function() {
    var tex = loader.resources['cards'].textures;
    var code = this.showCode;
    var num = code & 0xf;
    var suit = code >> 4;

    var face = this.face;
    face.children[1].texture = num > 0 ? tex[suit % 2 + "_" + num + ".png"]: PIXI.Texture.EMPTY;
    face.children[2].texture = suit !== 0 ? tex[suit + "_big.png"] : PIXI.Texture.EMPTY;
    face.children[3].texture = suit !== 0 ? tex[suit + "_small.png"] : PIXI.Texture.EMPTY;
};

CardSprite.prototype.update = function(dt) {
    var inner = this.inner;
    if (this.code > 0 && inner.euler.y > 0) {
        inner.euler.y = Math.max(0, inner.euler.y - dt * 5);
    }
    if (this.code == 0 && inner.euler.y < Math.PI) {
        inner.euler.y = Math.min(Math.PI, inner.euler.y + dt * 5);
    }
    inner.position.z = -Math.sin(inner.euler.y) * this.back.width;

    //assignment is overriden, so its actually calling euler.copy(this.euler)
    this.shadow.euler = inner.euler;
};

CardSprite.prototype.checkFace = function() {
    var inner = this.inner;
    var cc;

    var v = inner.computedTransform.getVisibleSide(this.worldProjection.eyeVec);
    if (v > 0) {
        //user sees the back
        cc = 0;
    } else {
        //user sees the face
        cc = this.showCode || this.code;
    }
    if (cc==0) {
        this.back.renderable = true;
        this.face.renderable = false;
    } else {
        this.back.renderable = false;
        this.face.renderable = true;
    }

    if (cc !== this.showCode) {
        this.showCode = cc;
        this.updateFace();
    }
};

function dealHand() {
    cards.removeChildren();
    for (var i=0;i<5;i++) {
        var card = new CardSprite();
        card.position.x = 56 * (i-2);
        if ((Math.random()*3 | 0) == 0) {
            onClick({target: card});
        }
        card.update(0);
        card.interactive = true;
        card.on('mouseup', onClick);
        card.on('touchend', onClick);
        cards.addChild(card);
    }
}

function onClick(event) {
    var target = event.target;
    if (target.code == 0) {
        var num = (Math.random()*13 | 0) + 2;
        var suit = (Math.random()*4 | 0) + 1;
        target.code = suit * 16 + num;
    } else {
        target.code = 0;
    }
}

function addText(txt) {
    var style = {
        font: "normal 80px Arial",
        fill: '#f5ffe3',
        dropShadow: true,
        dropShadowColor: 'rgba(1, 1, 1, 0.4)',
        dropShadowDistance: 6,
        wordWrap: false
    };
    var basicText = new PIXI.Text(txt, style);
    basicText.position.x = -240;
    basicText.position.y = 20;
    basicText.zIndex = 3;
    camera.addChild(basicText);
}

function onAssetsLoaded() {
    //background must be UNDER camera, it doesnt have z-index or any other bullshit for camera
    stage.addChildAt(new PIXI.Sprite(loader.resources.table.texture), 0);
    dealHand();
    addText('Tap on cards');
    // start animating
    ticker.start();
}

var ticker = PIXI.ticker.shared;
// start it after assets are loaded
ticker.autoStart = false;

ticker.add(function(deltaTime) {
    for (var i=0;i<cards.children.length;i++) {
        cards.children[i].update(deltaTime / 60.0);
    }

    renderer.render(stage);
});
