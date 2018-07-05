'use strict';

//
// ─── GAME BASE CLASS ────────────────────────────────────────────────────────────
//

class GameApp
{
    constructor(canvasId)
    {
        this.gl = document.getElementById(canvasId).getContext("webgl");
        
        this._prevTime = 0;
        this._deltaTime = 0;

        requestAnimationFrame(this._mainLoop.bind(this));
    }

    update(time, deltaTime) {}

    render(time, deltaTime) {}

    _mainLoop(_time)
    {
        this._deltaTime = _time - this._prevTime;
        this._prevTime = _time;

        this.update(_time, this._deltaTime);
        this.render(_time, this._deltaTime);

        requestAnimationFrame(this._mainLoop.bind(this));
    }
}
