import { jsonPrune, toDegrees, toRadians, jsonGet, jsonSet, jsonCheck, isEmptyObject, copy, clamp, round, arrEqual } from "../src/main";
import { expect } from 'chai';
import { describe, it } from 'mocha';



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
        expect(json).to.deep.equal({
            "a": 1,
            "b": {
                "c": "2"
            }
        });
    });


    it("toDegrees()", function () {
        expect(toDegrees([0, Math.PI, 3 * Math.PI])).to.deep.equal([0, 180, 540]);
    });


    it("toRadians()", function () {
        expect(toRadians([0, 180, 540])).to.deep.equal([0, Math.PI, 3 * Math.PI]);
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
        expect(jsonGet(json, "b.c")).to.equal("2");
        expect(jsonGet(json, "a")).to.equal(1);
        expect(jsonGet(json, "a.b")).to.equal(undefined);
        expect(jsonGet(json, "k")).to.equal(null);
        expect(jsonGet(json, "h.e.l.l.o")).to.equal(undefined);
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
        expect(json.b.c).to.equal("42");
        jsonSet(json, "a", 42);
        expect(json.a).to.equal(42);
        jsonSet(json, "k", undefined);
        expect(json.k).to.equal(undefined);
        jsonSet(json, "h", true);
        expect(json.h).to.equal(true);
        jsonSet(json, "y.e.s", "yes");
        expect(json.y.e.s).to.equal("yes");
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
        expect(jsonCheck(json, "b.c")).to.equal(true);
        expect(jsonCheck(json, "a")).to.equal(true);
        expect(jsonCheck(json, "a.b")).to.equal(false);
        expect(jsonCheck(json, "k")).to.equal(false);
        expect(jsonCheck(json, "h.e.l.l.o")).to.equal(false);
    });


    it("isEmptyObject()", function () {
        expect(isEmptyObject({})).to.equal(true);
        expect(isEmptyObject({ "a": 1 })).to.equal(false);
        expect(isEmptyObject({ "a": undefined })).to.equal(false);
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
        expect(copyJson).to.deep.equal(json);
        expect(copyJson).to.not.equal(json);
    });


    it("clamp()", function () {
        expect(clamp(0, 0, 1)).to.equal(0);
        expect(clamp(0.5, 0, 1)).to.equal(0.5);
        expect(clamp(1, 0, 1)).to.equal(1);
        expect(clamp(2, 0, 1)).to.equal(1);
        expect(clamp(2, 0)).to.equal(2);
        expect(clamp(2, undefined, 1)).to.equal(1);
        expect(clamp(-1, 0, 1)).to.equal(0);
    });


    it("round()", function () {
        expect(round(0.1234, 10)).to.equal(0);
        expect(round(0.666, 0.5)).to.equal(0.5);
        expect(round(43.1554, 4)).to.equal(44);
        expect(round(0.5554, 1)).to.equal(1);
        expect(round(0.1554, 0.1)).to.equal(0.2);
    });


    it("arrEqual()", function () {
        expect(arrEqual([0.1, 0.3, 0.5, 0.7], [0.6, 0.4, 1.1, 42], 0.5)).to.equal(false);
        expect(arrEqual([0.1, 0.3, 0.5, 0.7], [0.6, 0.4, 0.4, 0.4], 0.5)).to.equal(true);
        expect(arrEqual([1, 2, 3, 4], [2, 3, 4, 5], 1)).to.equal(true);
        expect(arrEqual([1, 2, 3, 4], [2, 3, 4, 2], 1)).to.equal(false);
        expect(arrEqual([0, 10, 100, 1000], [0, 10, 100, 1000], 0)).to.equal(true);
    });


});