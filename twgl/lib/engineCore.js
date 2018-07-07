'use strict';

var generalSpriteVS = `
uniform mat4 u_viewProj;

// per Instance
attribute mat4 i_world;
attribute vec4 i_tintColor;
attribute vec4 i_texOffsetScale; // (x, y) -> texOffset; (z, w) -> texScale (inv of tiling);

// per Vertex
attribute vec4 position;
attribute vec2 texcoord;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec4 v_tintColor;

void main()
{
    // Convert texture coord w.r.t. i_texOffsetScale
    v_texCoord = vec2(texcoord.x / i_texOffsetScale.z + i_texOffsetScale.x,
        texcoord.y / i_texOffsetScale.w + i_texOffsetScale.y);

    v_position = i_world * position;
    v_tintColor = i_tintColor;
}
`;

var generalSpriteFS = `
precision mediump float;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec4 v_tintColor;

uniform sampler2D u_mainTex;

void main()
{
    // Sample the texture and tint then finish.
    // The * operator works component-wise for vectors like vec4.
    gl_FragColor = texture2D(u_mainTex, v_texCoord) * v_tintColor;
}
`;

//
// ─── HELPER FUNCTION FOR M4 MULTPLY V3 ──────────────────────────────────────────
//
// This might be not so efficient...
function mulVecMat(mat, vec)
{
    // twgl.m4 stores matrix in column - major, that is:
    // 0   4   8   12
    // 1   5   9   13
    // 2   6   10  14
    // 3   7   11  15
    return twgl.v3.create(
        mat[0] * vec[0] + mat[4] * vec[1] + mat[8] * vec[2], /*x*/
        mat[1] * vec[0] + mat[5] * vec[1] + mat[9] * vec[2], /*y*/
        mat[2] * vec[0] + mat[6] * vec[1] + mat[10]* vec[2]  /*z*/);
}

//
// ─── MATERIAL ───────────────────────────────────────────────────────────────────
//
class Material
{
    // A material could have:
    // A shader (twgl.createProgramInfo)
    // Many attributes needed by the shader

    constructor({
        programInfo = undefined,
        uniforms = undefined,
    } = {})
    {
        this.programInfo = programInfo;
        this.uniforms = uniforms;
    }

    setUpMaterial(gl)
    {
        gl.useProgram(this.programInfo.program);
        twgl.setUniforms(this.programInfo, this.uniforms);
    }

    getProgramInfo()
    {
        return this.programInfo;
    }

    setUniform(uniforms)
    {
        this.uniforms = uniforms;
    }

    getUniform()
    {
        return this.uniforms;
    }
}

//
// ─── RENDER OBJECT ──────────────────────────────────────────────────────────────
//
class RenderObject
{
    constructor({
        material = undefined,
        bufferInfo = undefined,

        // undefined will be automatically translate to gl.TRIANGLES during render.
        drawType = undefined,
        gl = undefined,
    } = {})
    {
        this.material = material;
        this.bufferInfo = bufferInfo;

        this.drawType = drawType;
        this.vertexArrayInfo = undefined;

        // Render objects need to form a (1-way) linked list
        // to improve performance
        this.nextObject = undefined;
        this.prevObject = undefined;
        this.parentList = undefined;

        if(typeof gl !== "undefined")
        {
            this.drawType = (this.drawType === undefined) ? gl.TRIANGLES : this.drawType;

            this.vertexArrayInfo = twgl.createVertexArrayInfo(gl, this.material.getProgramInfo(), this.bufferInfo);
        }
    }

    prepareRender(gl)
    {
        if(typeof this.drawType === "undefined")
        {
            this.drawType = gl.TRIANGLES;
        }

        if(typeof this.vertexArrayInfo == "undefined")
        {
            this.vertexArrayInfo = twgl.createVertexArrayInfo(gl, this.material.getProgramInfo(), this.bufferInfo);
        }
    }

    render(gl)
    {
        this.prepareRender(gl);

        this.material.setUpMaterial(gl);
        twgl.setBuffersAndAttributes(gl, this.material.getProgramInfo(), this.vertexArrayInfo);
        twgl.drawBufferInfo(gl, this.vertexArrayInfo, this.drawType, this.vertexArrayInfo.numelements, 0, 1);
    }
}

//
// ─── SPRITE RENDER OBJECT ───────────────────────────────────────────────────────
//
// A object of "Sprite RenderObject" stands for a set of sprites that shares same material (image file),
// And they could have different position, rotation, tint color, sprite sheet etc.
// This class should be used inside sprite class.
class SpriteRenderObject extends RenderObject
{
    constructor(gl, {
        spriteFile = "Assets/Images/test.png",
        sizeX = 1,
        sizeY = 1,
    } = {})
    {
        super({
            material: new Material({
                programInfo: twgl.createProgramInfo(gl, [generalSpriteVS, generalSpriteFS]),
                uniforms:{
                    // OMG how to deal with instances...
                    // emmmmmm...
                    /*
                        Use a linked list to hold all instances (Sprites).
                        Iterate over the linked list to get an instance buffer. (O(n))
                        Only update (iterate the whole list) when adding or removing sprites.
                        Multiple actions in one frame will be combined to a single iteration.
                        Add / Remove elements costs O(1), and a single O(n) to iterate them all.

                        The instance buffer (array) will have a fixed size at beginning, and it will
                        become 1.5x (realloc) if needed. (just like std::vector, 1.5x instead of 2x)

                        Each element hold an index after iteration (creation / modification of the instance buffer),
                        To directly update their instance data.
                        After iteration, the SpriteRenderObject will modify the index hold by each instances.
                        Instances could update data directly to the buffer without any extra cost.
                    */

                    // World matrix of each instance
                    i_world: [],

                    // Tint color (including alpha) of the sprite
                    i_tintColor: [],

                    // The sprite sheet texture trick thing
                    // (x, y) -> texOffset; (z, w) -> texScale (inv of tiling);
                    i_texOffsetScale: [],

                    // Texture of those sprites (they share the same texture)
                    u_mainTex: SpriteTexPool.Singleton().getTexture(spriteFile),
                },
            }),
            bufferInfo: twgl.createPlaneBufferInfo(gl, sizeX, sizeY, 1, 1, 
                twgl.m4.axisRotation([1, 0, 0], 1.5707963)), 
                // ^ Rotate the XZ plane to a XY plane.
                // (twgl's XYQuad is always square so we do not want it)
                // Not sure if this could introduce some precision problem ...
            drawType: gl.TRIANGLES,
            gl: gl,
        });
    }

    render(gl)
    {

    }
}

//
// ─── TRANSFORM ──────────────────────────────────────────────────────────────────
//

class Transform
{
    constructor({
        position = twgl.v3.create(0, 0, 0),
        rotation = twgl.m4.identity(),
        scale = twgl.v3.create(1, 1, 1),
        children = [],
        parent = undefined,
    } = {})
    {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.children = children;
        this.parent = parent;

        // Calculate the local and world matrix (initial)
        this.localMatrix =  twgl.m4.scale
                            (
                                twgl.m4.multiply
                                (
                                    twgl.m4.translation(this.position), 
                                    this.rotation
                                ), 
                                this.scale
                            );
        this.worldMatrix = this.getWorldMatrix();
    }

    update()
    {
        // Calculate the local and world matrix
        this.localMatrix =  twgl.m4.scale
                            (
                                twgl.m4.multiply
                                (
                                    twgl.m4.translation(this.position), 
                                    this.rotation
                                ), 
                                this.scale
                            );
        this.worldMatrix = this.getWorldMatrix();        
    }

    getWorldMatrix()
    {
        if(typeof this.parent !== "undefined")
        {
            return twgl.m4.multiply(this.parent.getWorldMatrix(), this.localMatrix);
        }
        else
        {
            return this.localMatrix;
        }
    }
}

//
// ─── GAME OBJECT ────────────────────────────────────────────────────────────────
//

class GameObject
{
    constructor(gl, {
        renderObject = undefined,
        transform = new Transform(),
    } = {})
    {
        this.gl = gl;
        this.renderObject = renderObject;
        this.transform = transform;
    }

    update(time, deltaTime)
    {
        this.transform.update();
    }
}

//
// ─── SPRITE TEXTURE POOL ───────────────────────────────────────────────────────
//

class SpriteTexPool
{
    static Singleton()
    {
        if(typeof SpriteTexPool.singleton == 'undefined')
        {
            SpriteTexPool.singleton = new SpriteTexPool();
        }

        return SpriteTexPool.singleton;
    }

    constructor()
    {
        this.spriteTexPool = {};
    }

    RegisterGameApp(game)
    {
        this.game = game;
        this.gl = this.game.gl;
    }

    getTexture(name)
    {
        if(typeof this.game !== "undefined")
        {
            if(!this.spriteTexPool.hasOwnProperty(name))
            {
                this.spriteTexPool[name] = twgl.createTexture(this.gl, {
                    src: name,
                    minMag: this.gl.NEAREST, // Assuming we r having pixel perfect ~w~
                })
            }

            return this.spriteTexPool[name];
        }
    }

    releaseTexture(name)
    {
        if(typeof this.game !== "undefined")
        {
            if(this.spriteTexPool.hasOwnProperty(name))
            {
                this.gl.deleteTexture(this.spriteTexPool[name]);
                delete this.spriteTexPool[name];
            }
        }
    }

    clearDict()
    {
        for(var key in this.spriteTexPool)
        {
            this.releaseTexture(key);
        }
    }
}

//
// ─── SPRITES ────────────────────────────────────────────────────────────────────
//

class Sprite extends GameObject
{
    constructor(gl, {
        spriteFile = "Assets/Images/test.png",
        initCell = 0,
        position = twgl.v3.create(0, 0, 0),
        rotation = twgl.m4.identity(),
        scale = twgl.v3.create(1, 1, 1),
        tintColor = [1, 1, 1, 1],
        sizeX = 1,
        sizeY = 1,
        parent = undefined,
    } = {})
    {
        /*
            material: new Material({
                programInfo: twgl.createProgramInfo(gl, [generalSpriteVS, generalSpriteFS]),
                uniforms: {
                    // The world matrix of this object
                    i_world: twgl.m4.identity(),

                    // Tint color (including alpha) of the sprite
                    i_tintColor: tintColor,

                    // The sprite sheet texture trick thing
                    i_texOffsetScale: [
                        // (x, y) -> texOffset; (z, w) -> texScale (inv of tiling);
                        initCell % ImageSizes[spriteFile].cellCountX,
                        Math.floor(initCell / ImageSizes[spriteFile].cellCountX),
                        ImageSizes[spriteFile].cellCountX,
                        ImageSizes[spriteFile].cellCountY
                    ],
                    u_mainTex: SpriteTexPool.Singleton().getTexture(spriteFile),
                }
            }),
            bufferInfo: twgl.createPlaneBufferInfo(gl, sizeX, sizeY, 1, 1, 
                twgl.m4.axisRotation([1, 0, 0], 1.5707963)), 
                // ^ Rotate the XZ plane to a XY plane.
                // (twgl's XYQuad is always square so we do not want it)
                // Not sure if this could introduce some precision problem ...
        */

        super(gl, {
            renderObject: undefined,
            transform: new Transform({
                position: position,
                rotation: rotation,
                scale: scale,
                parent: parent,
            }),
        });
    }
}

class RenderObjectList
{
    constructor()
    {
        this.headObject = undefined;
        this.currentObject = undefined;
    }

    // Push a renderObject in the front of the list.
    push(renderObject)
    {
        renderObject.parentList = this;

        renderObject.prevObject = undefined;
        renderObject.nextObject = this.headObject;

        if(typeof this.headObject !== "undefined")
        {
            this.headObject.prevObject = renderObject;
        }

        this.headObject = renderObject;
    }

    remove(renderObject)
    {
        // You are deleting objects not belong to this list!
        if(renderObject.parentList !== this)
        {
            return;
        }

        if(typeof renderObject.nextObject !== "undefined")
        {
            renderObject.nextObject.prevObject = renderObject.prevObject;
        }

        if(typeof renderObject.prevObject !== "undefined")
        {
            renderObject.prevObject.nextObject = renderObject.nextObject;
        }
        else
        // You are deleting the head node of this list (cuz it does not have prev and it is in this list)
        {
            this.headObject = this.headObject.nextObject;
        }
    }
}

class Renderer
{
    constructor()
    {
        this.objectList = new RenderObjectList();
    }

    render(gl, time, deltaTime)
    {
        // TODO: combine objects sharing same materials
        //       or sharing same shader but different uniforms
        for(var renderObject = this.objectList.headObject; typeof renderObject !== "undefined"; renderObject = renderObject.nextObject)
        {
            renderObject.render(gl);
        }
    }

    addObject(renderObject)
    {
        this.objectList.push(renderObject);
    }

    removeObject(renderObject)
    {
        this.objectList.remove(renderObject);
    }
}
