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
        "type_name":"atlassian_issue_jql",
        "display_name" : "Atlassian Issue Search by JQL",
        "description" : "Get issues list using a JQL query",
        "settings":[
        {
            "name":"endpoint",
            "display_name": "Atlassian URL",
            "type":"text",
            "description":"https://[organisation].atlassian.net",
            "default_value":""
        },
        {
            "name":"user_email",
            "display_name": "Account Email",
            "type":"text",
            "description":"Atlassian account email",
            "default_value":""
        },        
        {
            "name":"api_key",
            "display_name": "API Key",
            "type":"text",
            "description":"Log in to your Atlassian account to setup an API key",
            "default_value":""
        },
        {
            "name":"jql_query",
            "display_name": "JQL",
            "type":"text",
            "description":"JQL statement eg project='ABC' AND issuetype='Task' AND status='To Do'",
            "default_value":""
        },        
        {
            "name":"use_proxy",
            "display_name": "Use Proxy",
            "type":"boolean",
            "description":"Prevent CORS errors by using bypass proxy. Depends on server configuration",
            "default_value":"false"
        },
        {
            "name":"refresh_time",
            "display_name":"Refresh Time",
            "type":"text",
            "description":"In milliseconds",
            "default_value":5000
        }],
        newInstance:function(settings, newInstanceCallback, updateCallback){
            newInstanceCallback(new atlassian_issue_jql(settings, updateCallback));
        }
    });

    var atlassian_issue_jql = function (settings, updateCallback) {
        var self = this;
        var refreshTimer; 
        var currentSettings = settings; 

        const proxy = "http://"+window.location.hostname+":8080/"; 

        function getData(){

            let base64 = require('base-64'); 

            if(currentSettings.use_proxy) query_url = proxy + currentSettings.endpoint + "/rest/api/3/search";    
            else query_url = currentSettings.endpoint + "/rest/api/3/search";
            
            username = currentSettings.user_email; 
            password = currentSettings.api_key; 

            if(currentSettings.jql_query=="" || username=="" || password=="") {
                console.log("Empty JQL. Cannot proceed"); 
                return false; 
            }

            let headers = new Headers({}); 

            headers.append("Authorization", "Basic "+base64.encode(username+":"+password)); 
            headers.append("Content-Type", "application/json"); 
            headers.append("X-Atlassian-Token", "no-check");

            // headers.delete("User-Agent"); 

            fetch(query_url, {
                method: 'post',
                headers: headers,
                body: "{\"jql\": \""+currentSettings.jql_query+"\",\"fields\":[\"summary\",\"status\",\"assignee\"] }"
            })
            .then(response => response.text())
            .then((response) => {
                var newData;
                newData = JSON.parse(response);
                updateCallback(newData);          

            }).catch(error => {
                console.log('Request '+query_url+' failed ', error); 
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
