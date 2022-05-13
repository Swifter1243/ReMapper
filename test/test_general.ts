import { jsonPrune, toDegrees, toRadians, jsonGet, jsonSet, jsonCheck, isEmptyObject, copy, clamp, round, arrEqual } from "../src/main";
import { describe, it } from 'mocha';
import assert from 'assert';



describe("General", function () {


    it("jsonPrune()", function () {
        const json = {
            "a": 1,
            "b": {
                "c": "2",
                "d": {
                    "e": undefined
                }
            },
            "k": null
        };
        jsonPrune(json);
        assert.deepStrictEqual(json, {
            "a": 1,
            "b": {
                "c": "2"
            }
        });
    });


    it("toDegrees()", function () {
        assert.deepStrictEqual(toDegrees([0, Math.PI, 3 * Math.PI]), [0, 180, 540]);
    });


    it("toRadians()", function () {
        assert.deepStrictEqual(toRadians([0, 180, 540]), [0, Math.PI, 3 * Math.PI]);
    });


    it("jsonGet()", function () {
        const json = {
            "a": 1,
            "b": {
                "c": "2",
                "d": {
                    "e": undefined
                }
            },
            "k": null
        };
        assert.strictEqual(jsonGet(json, "b.c"), "2");
        assert.strictEqual(jsonGet(json, "a"), 1);
        assert.strictEqual(jsonGet(json, "a.b"), undefined);
        assert.strictEqual(jsonGet(json, "k"), null);
        assert.strictEqual(jsonGet(json, "h.e.l.l.o"), undefined);
        
    });


    it("jsonSet()", function () {
        const json: any = {
            "a": 1,
            "b": {
                "c": "2",
                "d": {
                    "e": undefined
                }
            },
            "k": null
        };
        jsonSet(json, "b.c", "42");
        assert.strictEqual(json.b.c, "42");
        jsonSet(json, "a", 42);
        assert.strictEqual(json.a, 42);
        jsonSet(json, "k", undefined);
        assert.strictEqual(json.k, undefined);
        jsonSet(json, "h", true);
        assert.strictEqual(json.h, true);
        jsonSet(json, "y.e.s", "yes");
        assert.strictEqual(json.y.e.s, "yes");
    });


    it("jsonCheck()", function () {
        const json = {
            "a": 0,
            "b": {
                "c": "2",
                "d": {
                    "e": undefined
                }
            },
            "k": null
        };
        assert.strictEqual(jsonCheck(json, "b.c"), true);
        assert.strictEqual(jsonCheck(json, "a"), true);
        assert.strictEqual(jsonCheck(json, "a.b"), false);
        assert.strictEqual(jsonCheck(json, "k"), false);
        assert.strictEqual(jsonCheck(json, "h.e.l.l.o"), false);
    });


    it("isEmptyObject()", function () {
        assert.strictEqual(isEmptyObject({}), true);
        assert.strictEqual(isEmptyObject({ "a": 1 }), false);
        assert.strictEqual(isEmptyObject({ "a": undefined }), false);
        assert.strictEqual(isEmptyObject({ "a": null }), false);
    });


    it("copy()", function () {
        const json = {
            "a": 1,
            "b": {
                "c": "2",
                "d": {
                    "e": undefined
                },
                "l": [1, 2, 3]
            },
            "k": null,
            "o": this.k
        };
        const copyJson = copy(json);
        assert.deepStrictEqual(copyJson, json);
        assert.notStrictEqual(copyJson, json);
    });


    it("clamp()", function () {
        assert.strictEqual(clamp(0, 0, 1), 0);
        assert.strictEqual(clamp(0.5, 0, 1), 0.5);
        assert.strictEqual(clamp(1, 0, 1), 1);
        assert.strictEqual(clamp(2, 0, 1), 1);
        assert.strictEqual(clamp(2, 0), 2);
        assert.strictEqual(clamp(2, undefined, 1), 1);
        assert.strictEqual(clamp(-1, 0, 1), 0);
    });


    it("round()", function () {
        assert.strictEqual(round(0.1234, 10), 0);
        assert.strictEqual(round(0.666, 0.5), 0.5);
        assert.strictEqual(round(43.1554, 4), 44);
        assert.strictEqual(round(0.5554, 1), 1);
        assert.strictEqual(round(0.1554, 0.1), 0.2);
    });


    it("arrEqual()", function () {
        assert.strictEqual(arrEqual([0.1, 0.3, 0.5, 0.7], [0.6, 0.4, 1.1, 42], 0.5), false);
        assert.strictEqual(arrEqual([0.1, 0.3, 0.5, 0.7], [0.6, 0.4, 0.4, 0.4], 0.5), true);
        assert.strictEqual(arrEqual([1, 2, 3, 4], [2, 3, 4, 5], 1), true);
        assert.strictEqual(arrEqual([1, 2, 3, 4], [2, 3, 4, 2], 1), false);
        assert.strictEqual(arrEqual([0, 10, 100, 1000], [0, 10, 100, 1000], 0), true);
    });


});