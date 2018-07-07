'use strict';

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
    constructor({

    } = {})
    {

    }

    render(gl)
    {

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
