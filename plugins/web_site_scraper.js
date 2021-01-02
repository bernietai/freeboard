// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ freeboard-actuator-plugin                                          │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ http://blog.onlinux.fr/?tag=freeboard                              │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                    │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Freeboard widget plugin.                                           │ \\
// └────────────────────────────────────────────────────────────────────┘ \\
(function () {
    //
    // DECLARATIONS
    //
    var LOADING_INDICATOR_DELAY = 1000;

    //

    freeboard.loadDatasourcePlugin({
        "type_name":"web_site_scraper",
        "display_name" : "Web Site Scraper",
        "description" : "Get any HTML value from any web URL",
        "settings":[
        {
            "name":"query_url",
            "display_name": "URL",
            "type":"text",
            "description":"URL to query",
            "default_value":""
        },        
        {
            "name":"query_selector",
            "display_name": "JQuery Selector",
            "type":"text",
            "description":"JQuery selector name eg '#id'",
            "default_value":""
        },
        {
            "name":"refresh_time",
            "display_name":"Refresh Time",
            "type":"text",
            "description":"In milliseconds",
            "default_value":5000
        }],
        newInstance:function(settings, newInstanceCallback, updateCallback){
            newInstanceCallback(new web_site_scaper(settings, updateCallback));
        }
    });

    var web_site_scaper = function (settings, updateCallback) {
        var self = this;
        var refreshTimer; 
        var currentSettings = settings; 

        function getData(){

            const jquery = require('jquery'); 
            const proxy = "http://"+window.location.hostname+":8080/"; 
            
            var query_url = currentSettings.query_url; 
            var query_selector = currentSettings.query_selector;
            var newData;

            fetch(proxy+query_url)
            // fetch(query_url)
            .then(response => response.text())
            .then((response) => {

                try{
                    var html = jQuery.parseHTML(response, null, false); 
                    var el = $(html).find(query_selector);                                      
                    if(el) {
                        newData = {value : el.html()};
                    }                        
                }catch(e){

                }

                updateCallback(newData);          
                
                return newData(); 

            }).catch(error => {
                console.log('Request '+query_url+' failed'); 
                updateCallback(null); 
            });
        }

        function createRefreshTimer(interval){
            if(refreshTimer){
                clearInterval(refreshTimer); 
            }

            refreshTimer = setInterval(function(){
                getData(); 
            }, interval); 
        }

        this.updateNow = function(){
            getData(); 
        }
        
        this.onSettingsChanged = function(newSettings){
            currentSettings = newSettings;
            createRefreshTimer;
        }

        this.onDispose = function(){
            clearInterval(refreshTimer);
            refreshTimer = undefined; 
        }

        createRefreshTimer(currentSettings.refresh_time);
    };

}());
