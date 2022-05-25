// Ported from https://github.com/mrdoob/three.js
import { clamp } from "./general.ts";

export class Euler {
    x: number;
    y: number;
    z: number;
    order: string;

    constructor(x = 0, y = 0, z = 0, order = "XYZ") {
        this.x = x;
        this.y = y;
        this.z = z;
        this.order = order;
    }

    setFromQuaternion(q: Quaternion, order: string = this.order) {
        const matrix = new Matrix4().makeRotationFromQuaternion(q);
        return this.setFromRotationMatrix(matrix, order);
    }

    setFromRotationMatrix(m: Matrix4, order = this.order) {

        // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

        const te = m.elements;
        const m11 = te[0], m12 = te[4], m13 = te[8];
        const m21 = te[1], m22 = te[5], m23 = te[9];
        const m31 = te[2], m32 = te[6], m33 = te[10];

        switch (this.order) {

            case 'XYZ':

                this.y = Math.asin(clamp(m13, - 1, 1));

                if (Math.abs(m13) < 0.9999999) {

                    this.x = Math.atan2(- m23, m33);
                    this.z = Math.atan2(- m12, m11);

                } else {

                    this.x = Math.atan2(m32, m22);
                    this.z = 0;

                }

                break;

            case 'YXZ':

                this.x = Math.asin(- clamp(m23, - 1, 1));

                if (Math.abs(m23) < 0.9999999) {

                    this.y = Math.atan2(m13, m33);
                    this.z = Math.atan2(m21, m22);

                } else {

                    this.y = Math.atan2(- m31, m11);
                    this.z = 0;

                }

                break;

            case 'ZXY':

                this.x = Math.asin(clamp(m32, - 1, 1));

                if (Math.abs(m32) < 0.9999999) {

                    this.y = Math.atan2(- m31, m33);
                    this.z = Math.atan2(- m12, m22);

                } else {

                    this.y = 0;
                    this.z = Math.atan2(m21, m11);

                }

                break;

            case 'ZYX':

                this.y = Math.asin(- clamp(m31, - 1, 1));

                if (Math.abs(m31) < 0.9999999) {

                    this.x = Math.atan2(m32, m33);
                    this.z = Math.atan2(m21, m11);

                } else {

                    this.x = 0;
                    this.z = Math.atan2(- m12, m22);

                }

                break;

            case 'YZX':

                this.z = Math.asin(clamp(m21, -1, 1));

                if (Math.abs(m21) < 0.9999999) {

                    this.x = Math.atan2(- m23, m22);
                    this.y = Math.atan2(- m31, m11);

                } else {

                    this.x = 0;
                    this.y = Math.atan2(m13, m33);

                }

                break;

            case 'XZY':

                this.z = Math.asin(-clamp(m12, -1, 1));

                if (Math.abs(m12) < 0.9999999) {

                    this.x = Math.atan2(m32, m22);
                    this.y = Math.atan2(m13, m11);

                } else {

                    this.x = Math.atan2(- m23, m33);
                    this.y = 0;

                }

                break;

            default:
                console.warn('THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + order);

        }

        this.order = order;

        return this;
    }

    toArray(includeOrder = false) {
        if (includeOrder) return [this.x, this.y, this.z, this.order];
        return [this.x, this.y, this.z];
    }
}

export class Matrix4 {
    elements = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    makeRotationFromQuaternion(q: Quaternion) {
        return this.compose(new Vector3(0, 0, 0), q, new Vector3(1, 1, 1));
    }

    compose(position: Vector3, quaternion: Quaternion, scale: Vector3) {
        const te = this.elements;

        const x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        const sx = scale.x, sy = scale.y, sz = scale.z;

        te[0] = (1 - (yy + zz)) * sx;
        te[1] = (xy + wz) * sx;
        te[2] = (xz - wy) * sx;
        te[3] = 0;

        te[4] = (xy - wz) * sy;
        te[5] = (1 - (xx + zz)) * sy;
        te[6] = (yz + wx) * sy;
        te[7] = 0;

        te[8] = (xz + wy) * sz;
        te[9] = (yz - wx) * sz;
        te[10] = (1 - (xx + yy)) * sz;
        te[11] = 0;

        te[12] = position.x;
        te[13] = position.y;
        te[14] = position.z;
        te[15] = 1;

        return this;
    }
}

export class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    applyEuler(euler: Euler) {
        return this.applyQuaternion(new Quaternion().setFromEuler(euler));
    }

    applyQuaternion(q: Quaternion) {
        const x = this.x, y = this.y, z = this.z;
        const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

        // calculate quat * vector

        const ix = qw * x + qy * z - qz * y;
        const iy = qw * y + qz * x - qx * z;
        const iz = qw * z + qx * y - qy * x;
        const iw = - qx * x - qy * y - qz * z;

        // calculate result * inverse quat

        this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
        this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
        this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

        return this;
    }
}

export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    setFromEuler(euler: Euler) {
        const x = euler.x, y = euler.y, z = euler.z, order = euler.order;

        // http://www.mathworks.com/matlabcentral/fileexchange/
        // 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
        //	content/SpinCalc.m

        const cos = Math.cos;
        const sin = Math.sin;

        const c1 = cos(x / 2);
        const c2 = cos(y / 2);
        const c3 = cos(z / 2);

        const s1 = sin(x / 2);
        const s2 = sin(y / 2);
        const s3 = sin(z / 2);

        switch (order) {
            case 'XYZ':
                this.x = s1 * c2 * c3 + c1 * s2 * s3;
                this.y = c1 * s2 * c3 - s1 * c2 * s3;
                this.z = c1 * c2 * s3 + s1 * s2 * c3;
                this.w = c1 * c2 * c3 - s1 * s2 * s3;
                break;

            case 'YXZ':
                this.x = s1 * c2 * c3 + c1 * s2 * s3;
                this.y = c1 * s2 * c3 - s1 * c2 * s3;
                this.z = c1 * c2 * s3 - s1 * s2 * c3;
                this.w = c1 * c2 * c3 + s1 * s2 * s3;
                break;

            case 'ZXY':
                this.x = s1 * c2 * c3 - c1 * s2 * s3;
                this.y = c1 * s2 * c3 + s1 * c2 * s3;
                this.z = c1 * c2 * s3 + s1 * s2 * c3;
                this.w = c1 * c2 * c3 - s1 * s2 * s3;
                break;

            case 'ZYX':
                this.x = s1 * c2 * c3 - c1 * s2 * s3;
                this.y = c1 * s2 * c3 + s1 * c2 * s3;
                this.z = c1 * c2 * s3 - s1 * s2 * c3;
                this.w = c1 * c2 * c3 + s1 * s2 * s3;
                break;

            case 'YZX':
                this.x = s1 * c2 * c3 + c1 * s2 * s3;
                this.y = c1 * s2 * c3 + s1 * c2 * s3;
                this.z = c1 * c2 * s3 - s1 * s2 * c3;
                this.w = c1 * c2 * c3 - s1 * s2 * s3;
                break;

            case 'XZY':
                this.x = s1 * c2 * c3 - c1 * s2 * s3;
                this.y = c1 * s2 * c3 - s1 * c2 * s3;
                this.z = c1 * c2 * s3 + s1 * s2 * c3;
                this.w = c1 * c2 * c3 + s1 * s2 * s3;
                break;

            default:
                console.warn('THREE.Quaternion: .setFromEuler() encountered an unknown order: ' + order);

        }
        return this;
    }

    slerp(qb: Quaternion, t: number) {

        if (t === 0) return this;
        if (t === 1) return this.copy(qb);

        const x = this.x, y = this.y, z = this.z, w = this.w;

        // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

        let cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;

        if (cosHalfTheta < 0) {

            this.w = - qb.w;
            this.x = - qb.x;
            this.y = - qb.y;
            this.z = - qb.z;

            cosHalfTheta = - cosHalfTheta;

        } else {

            this.copy(qb);

        }

        if (cosHalfTheta >= 1.0) {

            this.w = w;
            this.x = x;
            this.y = y;
            this.z = z;

            return this;

        }

        const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

        if (sqrSinHalfTheta <= Number.EPSILON) {

            const s = 1 - t;
            this.w = s * w + t * this.w;
            this.x = s * x + t * this.x;
            this.y = s * y + t * this.y;
            this.z = s * z + t * this.z;

            this.normalize();

            return this;

        }

        const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
        const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
        const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
            ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

        this.w = (w * ratioA + this.w * ratioB);
        this.x = (x * ratioA + this.x * ratioB);
        this.y = (y * ratioA + this.y * ratioB);
        this.z = (z * ratioA + this.z * ratioB);

        return this;

    }

    copy(quaternion: Quaternion) {

        this.x = quaternion.x;
        this.y = quaternion.y;
        this.z = quaternion.z;
        this.w = quaternion.w;

        return this;
    }

    normalize() {
        let l = this.length();

        if (l === 0) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.w = 1;
        } else {

            l = 1 / l;

            this.x = this.x * l;
            this.y = this.y * l;
            this.z = this.z * l;
            this.w = this.w * l;

        }

        return this;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
}