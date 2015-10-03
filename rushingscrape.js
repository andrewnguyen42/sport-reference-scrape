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
var firstYear = 1932
var lastYear = 2014



var baseurl = "http://www.pro-football-reference.com/"

var urls = []

for (i = firstYear; i <= lastYear; i++) {
    urls.push(baseurl + "years/" + i + "/rushing.htm")
}



casper.start(baseurl, function() {
    this.echo(this.getTitle());
}).each(urls, function(self, link) {

    self.thenOpen(link, function() {
        this.echo(this.getTitle());
	this.clickLabel('CSV', 'span');
	this.waitForSelector('#csv_rushing_and_receiving',function(){
		this.echo('got that csv data');
	
	})
    });

})


casper.run();
