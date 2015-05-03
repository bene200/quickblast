var Blast = function(sequence, p, d, stype, proxyURL){
    var seq = sequence || "";
    var program = p || "blastp";
    var database = d || "nr";
    var stype = stype || "protein";
    var proxyURL = proxyURL || undefined;
    var jobId = "";
    var out = "";

    this.getProgram = function(){
        return program;
    };
    this.getDatabase = function(){
        return database;
    };
    this.getStype = function(){
        return stype;
    };
    this.getProxyURL = function(){
        return proxyURL;
    };
    this.getOutput = function(){
        return out;
    };
    this.setProgram = function(prgrm){
        program = prgrm;
    };
    this.setDatabase = function(db){
        database = db;
    };
    this.setStype = function(st){
        stype = st;
    };
    this.setProxyURL = function(url){
        proxyURL = url;
    };

    this.search = function(callback){
        var najax = require("najax");
        if(proxyURL === undefined){
            console.log("Please specify CORS-Proxy for cross-domain request");
        }
        else {
            var blastURL = "http://www.ncbi.nlm.nih.gov/blast/Blast.cgi";
            var cmd ="?CMD=Put&QUERY=" + encodeURIComponent(seq) 
                    + "&DATABASE=" + database
                    + "&PROGRAM=" + program
                    + "&HITLIST_SZE=10";
            var query = proxyURL + blastURL + cmd;
            najax({
                url: query,
                type: "GET",
                success: function(response){
                    var index = response.search("RID = ")+6;
                    var rid = response.substring(index, index + 12);
                    jobId = rid;
                    var cmdGet = "?CMD=Get&FORMAT_OBJECT=SearchInfo&RID=" + rid;
                    var interval = setInterval(function(){
                        najax({
                            url: proxyURL + blastURL + cmdGet,
                            type: "GET",
                            success: function(response){
                                if(response.indexOf("Status=WAITING") >= 0){
                                    console.log("Searching ....");
                                }
                                else {
                                    najax({
                                        url: proxyURL + blastURL + "?CMD=Get&FORMAT_TYPE=XML&RID=" + rid,
                                        type: "GET",
                                        success: function(re){
                                            out = re;
                                            callback();
                                        }
                                    });
                                    clearInterval(interval);
                                }
                            }
                        });
                    }, 5000);
                }
            });
        }
    };

    this.asFasta = function(x) {
        var xml = out;
        var begin = findAll(/<Hit_id/gi, xml);
        var end = findAll(/<\/Hit_id/gi, xml);
        var beginSeq = findAll(/<Hsp_hseq/gi, xml);
        var endSeq = findAll(/<\/Hsp_hseq/gi, xml);
        var fasta;
        for(var i=0; i<begin.length; i++){
            fasta += ">" + xml.substring(begin[i]+8, end[i]-1) + "\n" 
                + xml.substring(beginSeq[i]+10, endSeq[i]-1) + "\n";
        }
        return fasta;
    };

    function findAll(regex, file){
        var result;
        var ind = [];
        while ( (result = regex.exec(file)) ) {
            ind.push(result.index);
        }
        return ind;
    };

};
module.exports = Blast; 