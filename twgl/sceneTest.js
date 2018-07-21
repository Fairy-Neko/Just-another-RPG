'use strict';
class MiniRAID extends GameApp
{
    constructor(canvasId)
    {
        super(canvasId);
    }

    init()
    {
        // Load map
        // this.resourceUrls = [
        //     '../Assets/Maps/test.json',
        // ];

        // this.loader = new Loader();

        // this.loader.use(glTiled['resource-loader'].tiledMiddlewareFactory());
        // this.loader.add(this.resourceUrls);
        // this.loader.load(this.onLoad.bind(this));

        // Set blend state
        this.gl.enable(this.gl.BLEND);
        // this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        SpriteRenderObject.RegisterGameApp(this);
        SpriteTexPool.Singleton().RegisterGameApp(this);

        // Sprite groups
        var spriteGroupCount = 75;
        for(var i = 0; i < spriteGroupCount; i++)
        {
            var parentSprite = new Sprite(this.gl, {
                spriteFile: "/Assets/Images/TileSet/tmap_test.png",
                position: [-16 + i * (32 / (spriteGroupCount - 1)), 0, 0],
                initCell: getRandomInt(0, 8),
                preferredSize: 2 * spriteGroupCount
            });
            this.scene.push(parentSprite);
    
            var sprite = new Sprite(this.gl, {
                spriteFile: "/Assets/Images/TileSet/tmap_test.png",
                position: [0, 5, 0],
                sizeX: getRandomFloat(1, 2),
                sizeY: getRandomFloat(1, 2),
                initCell: getRandomInt(0, 8),
                preferredSize: 2 * spriteGroupCount,
                parent: parentSprite.transform
            });
            sprite.setCollider(new OBB({
                parentTransform: sprite.transform,
                size: [1, 1],
                rotation: 0
            }));
            this.scene.push(sprite);

            parentSprite.idx = i;
            // parentSprite.idx = getRandomInt(0, spriteGroupCount);

            sprite.update = function(time, deltaTime)
            {
                this.transform.position = [0, Math.sin(2 * time) * 2 + 5, 0];
                this.tintColor = [1, 1, 1, 1];
            }

            sprite.collides = function(other)
            {
                this.tintColor = [1, 0, 0, 0.4];
            }
    
            parentSprite.update = function(time, deltaTime)
            {
                this.rotate((-250.0 + this.idx * (500.0 / (spriteGroupCount - 1))) * deltaTime);
            }
        }

        // this.tilemap = new glTiled.GLTilemap(this.gl, this.loader.resources[this.resourceUrls[0]].data, this.loader.resources);

        // this.tilemap.resizeViewport(1024, 576);

        console.log(this.renderer);
        console.log("Game Inited.");
        super.startLoop();
    }

    update(time, deltaTime)
    {
        super.update(time, deltaTime);

        // this.tilemap.update(deltaTime);

        // Update fps meter
        var fpsLabel = document.getElementById("fpsLabel");
        fpsLabel.innerHTML = Math.round(1.0 / deltaTime) + " fps";
    }

    render(time, deltaTime)
    {
        // this.tilemap.draw(0, 0);
        super.render(time, deltaTime);
    }
}

var miniRAID = new MiniRAID("gameMainCanvas");
