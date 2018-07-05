'use strict';

class MiniRAID extends GameApp
{
    constructor(canvasId)
    {
        super(canvasId);
    }

    init()
    {
        console.log("Game Inited.");
    }

    update(time, deltaTime)
    {
        // Update fps meter
        var fpsLabel = document.getElementById("fpsLabel");
        fpsLabel.innerHTML = Math.round(1000.0 / deltaTime) + " fps";
    }

    render(time, deltaTime)
    {
        this.gl.clearColor(0.4, 0.5, 0.3, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
}

var miniRAID = new MiniRAID("gameMainCanvas");
