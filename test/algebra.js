/*
    Copyright 2018 0kims association.

    This file is part of zksnark JavaScript library.

    zksnark JavaScript library is a free software: you can redistribute it and/or
    modify it under the terms of the GNU General Public License as published by the
    Free Software Foundation, either version 3 of the License, or (at your option)
    any later version.

    zksnark JavaScript library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along with
    zksnark JavaScript library. If not, see <https://www.gnu.org/licenses/>.
*/

const chai = require("chai");

const bigInt = require("../src/bigint.js");
const BN128 = require("../src/bn128.js");
const F1Field = require("../src/zqfield.js");

const assert = chai.assert;


describe("F1 testing", () => {
    it("Should compute euclidean", () => {
        const F = new F1Field(bigInt(7));
        const res = F.inverse(bigInt(4));

        assert(F.equals(res, bigInt(2)));
    });

    it("Should multiply and divide in F1", () => {
        const bn128 = new BN128();
        const a = bigInt("1");
        const b = bn128.F1.affine(bigInt("-3"));
        const c = bn128.F1.mul(a,b);
        const d = bn128.F1.div(c,b);

        assert(bn128.F1.equals(a, d));
    });

    it("Should compute sqrts", () => {
        const bn128 = new BN128();
        const F = new F1Field(bn128.r);
        const a = bigInt("4");
        let b = F.sqrt(a);
        assert(F.equals(bigInt(0), F.sqrt(bigInt("0"))));
        assert(F.equals(b, bigInt("2")));
        assert(F.sqrt(F.nqr) === null);
    });

    it("Should compute sqrt of 100 random numbers", () => {
        const bn128 = new BN128();
        const F = new F1Field(bn128.r);
        for (let j=0;j<100; j++) {
            let a = F.random();
            let s = F.sqrt(a);
            if (s != null) {
                assert(F.equals(F.square(s), a));
            }
        }
    });
});

describe("Curve G1 Test", () => {
    it("r*one == 0", () => {
        const bn128 = new BN128();

        const res = bn128.G1.mulScalar(bn128.G1.g, bn128.r);

        assert(bn128.G1.equals(res, bn128.G1.zero), "G1 does not have range r");
    });

    it("Should add match in various in G1", () => {

        const bn128 = new BN128();

        const r1 = bigInt(33);
        const r2 = bigInt(44);

        const gr1 = bn128.G1.mulScalar(bn128.G1.g, r1);
        const gr2 = bn128.G1.mulScalar(bn128.G1.g, r2);

        const grsum1 = bn128.G1.add(gr1, gr2);

        const grsum2 = bn128.G1.mulScalar(bn128.G1.g, r1.add(r2));

        assert(bn128.G1.equals(grsum1, grsum2));
    });
});

describe("Curve G2 Test", () => {
    it ("r*one == 0", () => {
        const bn128 = new BN128();

        const res = bn128.G2.mulScalar(bn128.G2.g, bn128.r);

        assert(bn128.G2.equals(res, bn128.G2.zero), "G2 does not have range r");
    });

    it("Should add match in various in G2", () => {
        const bn128 = new BN128();

        const r1 = bigInt(33);
        const r2 = bigInt(44);

        const gr1 = bn128.G2.mulScalar(bn128.G2.g, r1);
        const gr2 = bn128.G2.mulScalar(bn128.G2.g, r2);

        const grsum1 = bn128.G2.add(gr1, gr2);

        const grsum2 = bn128.G2.mulScalar(bn128.G2.g, r1.add(r2));

        /*
        console.log(G2.toString(grsum1));
        console.log(G2.toString(grsum2));
        */

        assert(bn128.G2.equals(grsum1, grsum2));
    });
});

describe("F6 testing", () => {
    it("Should multiply and divide in F6", () => {
        const bn128 = new BN128();
        const a =
            [
                [bigInt("1"), bigInt("2")],
                [bigInt("3"), bigInt("4")],
                [bigInt("5"), bigInt("6")]
            ];
        const b =
            [
                [bigInt("12"), bigInt("11")],
                [bigInt("10"), bigInt("9")],
                [bigInt("8"), bigInt("7")]
            ];
        const c = bn128.F6.mul(a,b);
        const d = bn128.F6.div(c,b);

        assert(bn128.F6.equals(a, d));
    });
});

describe("F12 testing", () => {
    it("Should multiply and divide in F12", () => {
        const bn128 = new BN128();
        const a =
        [
            [
                [bigInt("1"), bigInt("2")],
                [bigInt("3"), bigInt("4")],
                [bigInt("5"), bigInt("6")]
            ],
            [
                [bigInt("7"), bigInt("8")],
                [bigInt("9"), bigInt("10")],
                [bigInt("11"), bigInt("12")]
            ]
        ];
        const b =
        [
            [
                [bigInt("12"), bigInt("11")],
                [bigInt("10"), bigInt("9")],
                [bigInt("8"), bigInt("7")]
            ],
            [
                [bigInt("6"), bigInt("5")],
                [bigInt("4"), bigInt("3")],
                [bigInt("2"), bigInt("1")]
            ]
        ];
        const c = bn128.F12.mul(a,b);
        const d = bn128.F12.div(c,b);

        assert(bn128.F12.equals(a, d));
    });
});

describe("Pairing", () => {
    it("Should match pairing", () => {
        for (let i=0; i<1; i++) {
            const bn128 = new BN128();

            const g1a = bn128.G1.mulScalar(bn128.G1.g, 25);
            const g2a = bn128.G2.mulScalar(bn128.G2.g, 30);

            const g1b = bn128.G1.mulScalar(bn128.G1.g, 30);
            const g2b = bn128.G2.mulScalar(bn128.G2.g, 25);

            const pre1a = bn128.precomputeG1(g1a);
            const pre2a = bn128.precomputeG2(g2a);
            const pre1b = bn128.precomputeG1(g1b);
            const pre2b = bn128.precomputeG2(g2b);

            const r1 = bn128.millerLoop(pre1a, pre2a);
            const r2 = bn128.millerLoop(pre1b, pre2b);

            const rbe = bn128.F12.mul(r1, bn128.F12.inverse(r2));

            const res = bn128.finalExponentiation(rbe);

            assert(bn128.F12.equals(res, bn128.F12.one));
        }
    }).timeout(10000);
    it("Should generate another pairing pairing", () => {
        for (let i=0; i<1; i++) {
            const bn128 = new BN128();

            const g1a = bn128.G1.mulScalar(bn128.G1.g, 10);
            const g2a = bn128.G2.mulScalar(bn128.G2.g, 1);

            const g1b = bn128.G1.mulScalar(bn128.G1.g, 1);
            const g2b = bn128.G2.mulScalar(bn128.G2.g, 10);

            const pre1a = bn128.precomputeG1(g1a);
            const pre2a = bn128.precomputeG2(g2a);
            const pre1b = bn128.precomputeG1(g1b);
            const pre2b = bn128.precomputeG2(g2b);

            const r1 = bn128.millerLoop(pre1a, pre2a);
            const r2 = bn128.finalExponentiation(r1);

            const r3 = bn128.millerLoop(pre1b, pre2b);

            const r4 = bn128.finalExponentiation(r3);


            /*
            console.log("ML1: " ,r1[0][0][0].affine(bn128.q).toString(16));
            console.log("FE1: " ,r2[0][0][0].affine(bn128.q).toString(16));
            console.log("ML2: " ,r3[0][0][0].affine(bn128.q).toString(16));
            console.log("FE2: " ,r4[0][0][0].affine(bn128.q).toString(16));
            */

            assert(bn128.F12.equals(r2, r4));


            const r5 = bn128.millerLoop(pre1b, pre2b);

            const rbe = bn128.F12.mul(r1, bn128.F12.inverse(r5));

            const res = bn128.finalExponentiation(rbe);

            assert(bn128.F12.equals(res, bn128.F12.one)); 
        }
    }).timeout(10000);
    it("Should match naive and optimized final exp", () => {
        const bn128 = new BN128();

        // (q^12-1)/r
        const final_exponent = bigInt("552484233613224096312617126783173147097382103762957654188882734314196910839907541213974502761540629817009608548654680343627701153829446747810907373256841551006201639677726139946029199968412598804882391702273019083653272047566316584365559776493027495458238373902875937659943504873220554161550525926302303331747463515644711876653177129578303191095900909191624817826566688241804408081892785725967931714097716709526092261278071952560171111444072049229123565057483750161460024353346284167282452756217662335528813519139808291170539072125381230815729071544861602750936964829313608137325426383735122175229541155376346436093930287402089517426973178917569713384748081827255472576937471496195752727188261435633271238710131736096299798168852925540549342330775279877006784354801422249722573783561685179618816480037695005515426162362431072245638324744480");
      
        // 2z(6z^2+3z+1)
        const cofactor = bigInt("1469306990098747947464455738335385361638823152381947992820");

        const g1 = bn128.G1.mulScalar(bn128.G1.g, 25);
        const g2 = bn128.G2.mulScalar(bn128.G2.g, 30);

        const pre1 = bn128.precomputeG1(g1);
        const pre2 = bn128.precomputeG2(g2);

        const r = bn128.millerLoop(pre1, pre2);

        // naive FE
        console.time("\t⏱  naive final exponentiation takes");
        const res_naive = bn128.F12.exp(r, final_exponent);
        console.timeEnd("\t⏱  naive final exponentiation takes");
        const res_naive_cofac = bn128.F12.exp(res_naive, cofactor);

        // optimized FE
        console.time("\t⏱  optimized final exponentiation takes");
        const res_opt = bn128.finalExponentiation(r);
        console.timeEnd("\t⏱  optimized final exponentiation takes");

        assert(bn128.F12.equals(res_opt, res_naive_cofac));

    }).timeout(10000);

});
