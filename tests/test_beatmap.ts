import { jsonPrune } from "../src/main";
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


});