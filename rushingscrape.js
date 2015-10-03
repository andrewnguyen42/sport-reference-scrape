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


//this is the first year we have NFL data from
var firstYear = 1932;
var lastYear = 2014;



var baseurl = "http://www.pro-football-reference.com/";

var urls = [];

//ugh I don't want to parse the urls for the year
var linkYearMap = {}
for (i = firstYear; i <= lastYear; i++) {
    urls.push(baseurl + "years/" + i + "/rushing.htm");
    linkYearMap[urls[urls.length - 1]] = i;

}

var csvData = "Rk,,Tm,Age,Pos,G,GS,Att,Yds,TD,Lng,Y/A,Y/G,A/G,Rec,Yds,Y/R,TD,Lng,R/G,Y/G,YScm,RRTD,Fmb \n";

casper.start(baseurl, function() {
    this.echo(this.getTitle());
}).each(urls, function(self, link) {

    self.thenOpen(link, function() {
        this.echo(this.getTitle());

        this.clickLabel('CSV', 'span');
        this.waitForSelector('#csv_rushing_and_receiving', function() {
            var tokens = this.fetchText('#csv_rushing_and_receiving').split('\n');

            tokens = tokens.filter(function(element) {
                return !(element.length === 0 || !element.trim()) && element.substring(0, 4) != ',,,,' && element.substring(0, 4) != 'Rk,,'
            })


            this.echo(tokens.length)
            tokens.forEach(function(entry, index) {
                casper.echo(entry);
                tokens[index] = tokens[index] += "," + linkYearMap[link]
                casper.echo(tokens[index])

            });
        })
    });

})

casper.then(function() {

    this.echo(csvData);


})

casper.run();
