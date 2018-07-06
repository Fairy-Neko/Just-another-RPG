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

        this.init();

        requestAnimationFrame(this._mainLoop.bind(this));
    }

    init() {}

    update(time, deltaTime) {}

    render(time, deltaTime) {}

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
