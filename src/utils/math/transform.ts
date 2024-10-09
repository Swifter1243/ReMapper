import {copy} from '../object/copy.ts'
import {arrayAdd, arraySubtract} from '../array/operation.ts'
import {getMatrixFromTransform, getTransformFromMatrix} from './matrix.ts'
import {AnimationSettings} from '../animation/optimizer.ts'
import {areKeyframesSimple} from '../animation/keyframe/complexity.ts'
import {areVectorsEqual} from '../array/check.ts'
import {bakeAnimation, getAnimatedObjectDomain, getKeyframeValuesAtTime,} from '../animation/mod.ts'
import {iterateKeyframes} from "../animation/keyframe/iterate.ts";
import {Vec3} from "../../types/math/vector.ts";
import {AnimatedTransform, FullAnimatedTransform, FullTransform, Transform} from "../../types/math/transform.ts";

import {RawKeyframesVec3} from "../../types/animation/keyframe/vec3.ts";
import {DeepReadonly} from "../../types/util/mutability.ts";
import {eulerFromQuaternion, toThreeQuaternion} from "./three_conversion.ts";

/**
 * Combine 2 rotations. Not commutative.
 */
export function combineRotations(
    target: Readonly<Vec3>,
    rotation: Readonly<Vec3>,
) {
    const targetQuaternion = toThreeQuaternion(target)
    const rotationQuaternion = toThreeQuaternion(rotation)
    targetQuaternion.premultiply(rotationQuaternion)
    return eulerFromQuaternion(targetQuaternion)
}

/**
 * Applies 2 transformations to each other.
 * @param child Input transformation.
 * @param parent Transformation to apply to the child.
 * @param anchor
 * @returns
 */
export function combineTransforms(
    child: DeepReadonly<Transform>,
    parent: DeepReadonly<Transform>,
    anchor?: Readonly<Vec3>,
): FullTransform {
    const newTarget = copy(child) as Transform
    const newTransform = copy(parent) as Transform

    newTarget.position ??= [0, 0, 0]
    newTarget.position = anchor ? arraySubtract(newTarget.position, anchor) : newTarget.position

    const targetM = getMatrixFromTransform(newTarget)
    const transformM = getMatrixFromTransform(newTransform)
    targetM.premultiply(transformM)
    const finalTarget = getTransformFromMatrix(targetM)

    const finalPos = anchor ? arrayAdd(finalTarget.position, anchor) : finalTarget.position

    return {
        position: finalPos,
        rotation: finalTarget.rotation,
        scale: finalTarget.scale,
    }
}

/** Applies a transformation to a point. */
export function applyTransformToPoint(
    transform: DeepReadonly<Transform>,
    point: Readonly<Vec3>
) {
    return combineTransforms({
        position: point,
    }, transform).position
}

/**
 * Emulate the behavior of a parent track by applying a parent transform to a child
 * The result is the transform of the child.
 */
export function emulateParent(
    child: DeepReadonly<AnimatedTransform>,
    parent: DeepReadonly<AnimatedTransform>,
    anchor: Readonly<Vec3> = [0, 0, 0],
    animationSettings?: AnimationSettings,
): FullAnimatedTransform {
    animationSettings ??= new AnimationSettings()

    enum Complexity {
        DEFAULT,
        SIMPLE,
        ANIMATED,
    }

    function getKeyframeComplexity(
        prop: DeepReadonly<RawKeyframesVec3>,
        defaultVal: DeepReadonly<Vec3>,
    ) {
        if (!areKeyframesSimple(prop)) return Complexity.ANIMATED
        const isDefault = areVectorsEqual(prop as DeepReadonly<Vec3>, defaultVal)
        return isDefault ? Complexity.DEFAULT : Complexity.SIMPLE
    }

    function getComplexity(
        obj: DeepReadonly<FullAnimatedTransform>,
    ) {
        return {
            position: getKeyframeComplexity(obj.position, [0, 0, 0]),
            rotation: getKeyframeComplexity(obj.rotation, [0, 0, 0]),
            scale: getKeyframeComplexity(obj.scale, [1, 1, 1]),
        }
    }

    function makeObj(obj: DeepReadonly<AnimatedTransform>) {
        return {
            position: obj.position ?? [0, 0, 0],
            rotation: obj.rotation ?? [0, 0, 0],
            scale: obj.scale ?? [1, 1, 1],
        } as DeepReadonly<FullAnimatedTransform>
    }

    const childObj = makeObj(child)
    const parentObj = makeObj(parent)

    const childComplexity = getComplexity(childObj)
    const parentComplexity = getComplexity(parentObj)

    // Both are completely static
    if (
        childComplexity.position <= 1 &&
        childComplexity.rotation <= 1 &&
        childComplexity.scale <= 1 &&
        parentComplexity.position <= 1 &&
        parentComplexity.rotation <= 1 &&
        parentComplexity.scale <= 1
    ) {
        return combineTransforms(
            child as Transform,
            parent as Transform,
            anchor,
        )
    }

    // Child position is simple, parent is animated
    if (
        childComplexity.position >= 1 &&
        parentComplexity.position <= 1 &&
        parentComplexity.rotation === Complexity.DEFAULT &&
        parentComplexity.scale === Complexity.DEFAULT
    ) {
        const childPos = copy(childObj.position) as RawKeyframesVec3
        const parentPos = parentObj.position as Vec3

        iterateKeyframes(childPos, (x) => {
            x[0] += parentPos[0]
            x[1] += parentPos[1]
            x[2] += parentPos[2]
        })

        return {
            position: childPos,
            rotation: copy(childObj.rotation) as RawKeyframesVec3,
            scale: copy(childObj.scale) as RawKeyframesVec3,
        }
    }

    // Parent position is simple, child is animated
    if (
        childComplexity.position <= 1 &&
        parentComplexity.position >= 1 &&
        parentComplexity.rotation === Complexity.DEFAULT &&
        parentComplexity.scale === Complexity.DEFAULT
    ) {
        const childPos = childObj.position as Vec3
        const parentPos = copy(parentObj.position) as RawKeyframesVec3

        iterateKeyframes(parentPos, (x) => {
            x[0] += childPos[0]
            x[1] += childPos[1]
            x[2] += childPos[2]
        })

        return {
            position: parentPos,
            rotation: copy(childObj.rotation) as RawKeyframesVec3,
            scale: copy(childObj.scale) as RawKeyframesVec3,
        }
    }

    // looks like we bakin
    const childDomain = getAnimatedObjectDomain(childObj)
    const parentDomain = getAnimatedObjectDomain(parentObj)

    const domain = {
        min: Math.min(childDomain.min, parentDomain.min),
        max: Math.max(childDomain.max, parentDomain.max),
    }

    return bakeAnimation(
        childObj,
        (k) => {
            const parentPos = getKeyframeValuesAtTime(
                'position',
                parentObj.position,
                k.time,
            )

            const parentRot = getKeyframeValuesAtTime(
                'rotation',
                parentObj.rotation,
                k.time,
            )

            const parentScale = getKeyframeValuesAtTime(
                'scale',
                parentObj.scale,
                k.time,
            )

            const t = combineTransforms({
                position: k.position,
                rotation: k.rotation,
                scale: k.scale,
            }, {
                position: parentPos,
                rotation: parentRot,
                scale: parentScale,
            }, anchor)

            Object.assign(k, t)
        },
        animationSettings,
        domain,
    )
}