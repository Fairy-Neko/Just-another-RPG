'use strict';
class MiniRAID extends GameApp
{
    constructor(canvasId)
    {
        super(canvasId);
    }

    init()
    {
        // Set blend state
        this.gl.enable(this.gl.BLEND);
        // this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        SpriteRenderObject.RegisterGameApp(this);
        SpriteTexPool.Singleton().RegisterGameApp(this);

        this.sCount = 8192;
        this.rate = 100;
        for(var i = 0; i < this.sCount; i++)
        {
            var s = new Sprite(this.gl, {
                spriteFile: "/Assets/Images/TileSet/tmap_test.png",
                position: [getRandomFloat(-16, 16), getRandomFloat(-9, 9), 0],
                tintColor: [getRandomFloat(0.8, 1), getRandomFloat(0.8, 1), getRandomFloat(0.8, 1), getRandomFloat(0.5, 1)],
                initCell: getRandomInt(0, 8),
                sizeX: 0.3,
                sizeY: 0.3,
                preferredSize: this.sCount * 1.2,
                layer: 0,
            });
            s.speed = [getRandomFloat(-3, 3), getRandomFloat(-3, 3), 0];

            s.update = function(time, deltaTime)
            {
                twgl.v3.add(this.transform.position, twgl.v3.mulScalar(this.speed, deltaTime), this.transform.position);
                this.rotate(5.0 * deltaTime);

                if(Math.abs(this.transform.position[0]) > 16)
                {
                    this.speed[0] *= -1;
                }
                if(Math.abs(this.transform.position[1]) > 9)
                {
                    this.speed[1] *= -1;
                }

                if(getRandomFloat(0, 1) < (this.scene.game.rate / this.scene.game.sCount))
                {
                    this.destroy();
                    this.scene.remove(this);
                }
            };

            this.scene.push(s);
        }

        console.log(this.renderer);
        console.log("Game Inited.");
    }

    update(time, deltaTime)
    {
        super.update(time, deltaTime);

        // Update fps meter
        var fpsLabel = document.getElementById("fpsLabel");
        fpsLabel.innerHTML = Math.round(1.0 / deltaTime) + " fps";

        var countLabel = document.getElementById("countLabel");
        countLabel.innerHTML = this.scene.objectList.size.toString();

        for(var i = 0; i < this.rate; i++)
        {
            var s = new Sprite(this.gl, {
                spriteFile: "/Assets/Images/TileSet/tmap_test.png",
                position: [getRandomFloat(-16, 16), getRandomFloat(-9, 9), 0],
                tintColor: [getRandomFloat(0.8, 1), getRandomFloat(0.8, 1), getRandomFloat(0.8, 1), getRandomFloat(0.5, 1)],
                initCell: getRandomInt(0, 8),
                sizeX: 0.3,
                sizeY: 0.3,
                preferredSize: this.sCount * 1.2,
                layer: 0,
            });
            s.speed = [getRandomFloat(-3, 3), getRandomFloat(-3, 3), 0];

            s.update = function(time, deltaTime)
            {
                twgl.v3.add(this.transform.position, twgl.v3.mulScalar(this.speed, deltaTime), this.transform.position);
                this.rotate(5.0 * deltaTime);

                if(Math.abs(this.transform.position[0]) > 16)
                {
                    this.speed[0] *= -1;
                }
                if(Math.abs(this.transform.position[1]) > 9)
                {
                    this.speed[1] *= -1;
                }

                if(getRandomFloat(0, 1) < (this.scene.game.rate / this.scene.game.sCount))
                {
                    this.destroy();
                    this.scene.remove(this);
                }
            };

            this.scene.push(s);
        }
    }

    render(time, deltaTime)
    {
        super.render(time, deltaTime);
    }
}

var miniRAID = new MiniRAID("gameMainCanvas");
