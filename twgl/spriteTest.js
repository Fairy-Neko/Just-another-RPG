'use strict';

var vs = `
uniform mat4 u_worldViewProjection;
uniform vec3 u_lightWorldPos;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform mat4 u_worldInverseTranspose;

attribute vec4 position;
attribute vec3 normal;
attribute vec2 texcoord;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

void main() 
{
    v_texCoord = texcoord;
    v_position = u_worldViewProjection * position;
    v_normal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
    v_surfaceToLight = u_lightWorldPos - (u_world * position).xyz;
    v_surfaceToView = (u_viewInverse[3] - (u_world * position)).xyz;
    gl_Position = v_position;
}`;

var fs = `
precision mediump float;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

uniform vec4 u_lightColor;
uniform vec4 u_ambient;
uniform sampler2D u_diffuse;
uniform vec4 u_specular;
uniform float u_shininess;
uniform float u_specularFactor;

vec4 lit(float l ,float h, float m) 
{
    return vec4(1.0,
                max(l, 0.0),
                (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
                1.0);
}

void main() 
{
    vec4 diffuseColor = texture2D(u_diffuse, v_texCoord);
    vec3 a_normal = normalize(v_normal);
    vec3 surfaceToLight = normalize(v_surfaceToLight);
    vec3 surfaceToView = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLight + surfaceToView);
    vec4 litR = lit(dot(a_normal, surfaceToLight),
                    dot(a_normal, halfVector), u_shininess);
    vec4 outColor = vec4((
    u_lightColor * (diffuseColor * litR.y + diffuseColor * u_ambient +
                u_specular * litR.z * u_specularFactor)).rgb,
        diffuseColor.a);
    gl_FragColor = outColor;
}
`;

const cubeArrays = {
    position: [1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1],
    normal:   [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
    texcoord: [1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    indices:  [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23],
};

class MiniRAID extends GameApp
{
    constructor(canvasId)
    {
        super(canvasId);
    }

    init()
    {
        console.log("Game Inited.");

        SpriteRenderObject.RegisterGameApp(this);
        SpriteTexPool.Singleton().RegisterGameApp(this);

        this.renderer = new Renderer();
        
        this.sprite1 = new Sprite(this.gl, {
            spriteFile: "/Assets/Images/test.png",
            position: [10, 0, 0],
            tintColor: [0, 0.7, 1, 1],
            initCell: 0,
            preferredSize: 16
        });

        this.renderer.addObject(SpriteRenderObject.getSpriteRenderObject("/Assets/Images/test.png"));

        console.log(this.renderer);
    }

    update(time, deltaTime)
    {
        // Update fps meter
        var fpsLabel = document.getElementById("fpsLabel");
        fpsLabel.innerHTML = Math.round(1.0 / deltaTime) + " fps";

        this.sprite1.update();

        this.sprite1.transform.position[0] -= deltaTime;
        this.sprite1.tintColor[0] += deltaTime * 0.2;
    }

    render(time, deltaTime)
    {
        twgl.resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        
        this.gl.clearColor(0.4, 0.5, 0.3, 1);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.renderer.render(this.gl, time, deltaTime);
    }
}

var miniRAID = new MiniRAID("gameMainCanvas");
