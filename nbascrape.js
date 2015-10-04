var fs = require('fs');

var casper = require('casper').create({
    verbose: true,
    pageSettings: {
        loadImages: false, // The WebPage instance used by Casper will
        loadPlugins: false, // use these settings
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)'
    },
    onWaitTimeout: function() {
        //throw new Error
        this.echo('step timeout');
        this.clear();
        this.page.stop();
    },
    onStepTimeout: function() {
        //throw new Error
        this.echo('step timeout');
        this.clear();
        this.page.stop();
    }
});


var dataType = "totals"


//let's hardcode some constants
dataTypeSelectorMap = {}
dataTypeSelectorMap["totals"] = "#csv_totals";


//TODO: let people pass in arguments
if (casper.cli.has("type")) {
    dataType = casper.cli.get("type")

}


//this is the first year we have NFL data from
//var firstYear = 1932;

var firstYear = 1950;
var lastYear = 2014;

//var lastYear = 2014;



var baseurl = "http://www.basketball-reference.com/";

var urls = [];

//ugh I don't want to parse the urls for the year
var linkYearMap = {}
for (i = firstYear; i <= lastYear; i++) {
    urls.push(baseurl + "leagues/NBA_" + i + "_totals.htm?lid=header_seasons");
    linkYearMap[urls[urls.length - 1]] = i;

}

var csvData = "";
var foundHeader = false;

var consistentHeader;

casper.start(baseurl, function() {
    this.echo(this.getTitle());
}).each(urls, function(self, link) {

    self.thenOpen(link, function() {
        this.echo("Scraping data from " + this.getTitle());

        this.clickLabel('CSV', 'span');
        this.waitForSelector(dataTypeSelectorMap[dataType], function() {
            var tokens = this.fetchText(dataTypeSelectorMap[dataType]).split('\n');


            var currentHeader;
            var hasInconsistentHeader = false;
            var badIndexes = {};

            for (i = 0; i < tokens.length; i++) {
                if (tokens[i].substring(0, 3) == 'Rk,') {

                    currentHeader = tokens[i];
                    break;

                }

            }


            if (!foundHeader) {
                foundHeader = true;
                csvData += currentHeader + ', Year \n'
                consistentHeader = currentHeader.split(',')

            } else {
                var compareHeader = currentHeader.split(',')
                    //we know that columns are never dropped
                if (compareHeader.length > consistentHeader.length) {
                    hasInconsistentHeader = true;
                    var offset = 0;
                    //always use the consistentHeader as a baseline
                    for (i = 0; i + offset < compareHeader.length; i++) {
                        if (compareHeader[i + offset] != consistentHeader[i]) {
                            offset += offset + 1;
                            badIndexes[i] = true;
                            casper.echo('INCONSISTENT HEADER: Rectifying...' )
                        }

                    }


                }


            }


            tokens = tokens.filter(function(element) {
                return !(element.length === 0 || !element.trim()) && element.substring(0, 4) != ',,,,' && element.substring(0, 3) != 'Rk,'
            })


            tokens.forEach(function(entry, index) {

                var dataString = ""

                if (hasInconsistentHeader) {
                    var data = tokens[index].split(',');
                    var dataString = ""
                    for (i = 0; i < data.length; i++) {
                        if (!badIndexes[i]){
                            dataString += data[i];
				if(i!=data.length-1)
		    			dataString += ','
			
			}
                    }

                } else {

                    dataString = tokens[index]
                }
                dataString += ','+ linkYearMap[link] + '\n'
                csvData += dataString

            });
        })
    });

})

casper.then(function() {

    this.echo(csvData);
    fs.write(dataType+'.csv', csvData, 'w');


})

casper.run();
