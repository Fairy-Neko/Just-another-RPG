'use strict';

//
// ─── GAME BASE CLASS ────────────────────────────────────────────────────────────
//

class GameApp
{
    constructor(canvasId)
    {
        this.gl = document.getElementById(canvasId).getContext("webgl");
        twgl.addExtensionsToContext(this.gl);
        if (!this.gl.drawArraysInstanced || !this.gl.createVertexArray) 
        {
            alert("need drawArraysInstanced and createVertexArray"); // eslint-disable-line
            return;
        }
        
        this._prevTime = 0;
        this._deltaTime = 0;

        this.renderer = new Renderer();
        RenderObject.RegisterGameApp(this);
        this.scene = new Scene({game: this});

        this.init();
    }

    init() {}

    update(time, deltaTime) 
    {
        this.scene.update(time, deltaTime);
    }

    render(time, deltaTime) 
    {
        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.disable(this.gl.CULL_FACE);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.renderer.render(this.gl, time, deltaTime);
    }

    startLoop()
    {
        requestAnimationFrame(this._mainLoop.bind(this));
    }

    _mainLoop(__time)
    {
        var _time = __time * 0.001;
        this._deltaTime = _time - this._prevTime;
        this._prevTime = _time;

        this.update(_time, this._deltaTime);
        this.render(_time, this._deltaTime);

        requestAnimationFrame(this._mainLoop.bind(this));
    }
}
