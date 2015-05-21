//Mocha unit tests for the quickblast module

var assert = require("assert");
var Qb = require("../lib/blast");

describe("Blast", function(){
    var seqMain = ">test\nIYNSIVTTHAFVMIFFFVMP";
    var qb = new Qb(seqMain, "blastp", "swissprot");

    it("should be robust to bad input", function(done){
        var seq = "MEFMEFMEQEFEOP";
        assert.throws(function(){
            new Qb(seq, "blastp", "nr");
        }, /fasta input needs to have a header/);
        seq = ">test\nABLKDLFJLLSKDJF";
        assert.throws(function(){
            new Qb(seq, "some", "nr");
        }, /invalid program/);
        assert.throws(function(){
            new Qb(seq, "blastp", "some");
        }, /invalid database/);
        var seq2 = ">test\nABC\n>test2\nABC";
        // assert.throws(function(){
        //     new Qb(seq2, "blastp", "nr");
        // }, /you can only have one input sequence/);
        assert.throws(function(){
            new Qb(23, "blastp", "nr");
        }, /sequence not of type string/);
        assert.doesNotThrow(function(){
            new Qb(seq, "blastp", "nr");
        });

        done();
    });

    describe("search", function(){
        this.timeout(60000);
        it("should perform a BLAST search and get a result", function(done){
            seq = ">test\nIYNSIVTTHAFVMIFFFVMP";
            qb = new Qb(seq, "blastp", "swissprot");
            qb.search(function(){
                assert.notEqual(qb.getOutput(), "");

                done();
            });
        });
    });

    describe("asFasta", function(){
        it("should transform the xml blast output to a correct fasta file", function(done){
            var fasta = qb.asFasta();
            var headers = fasta.match(/>.+\n/g);
            assert.notEqual(headers, null);
            var seqs = fasta.match(/\n\w+\n/g);
            assert.notEqual(seqs, null);
            assert.equal(headers.length, seqs.length);

            done();
        });
    });
});