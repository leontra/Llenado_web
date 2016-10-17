define(function () 
{
    var OnHttpRequestChange = function(event)
    {
        var httpRequest = event.target;
        
        if (httpRequest.readyState === 4 && httpRequest.status === 200)
            onSuccessRequestModel(httpRequest);
    }

    function onSuccessRequestModel(httpRequest)
    {
        var data = JSON.parse(httpRequest.response);
        httpRequest.callbackdata(data);
    }

    function doHttpRequest(metodo, llamado, callback, data)
    {
        var httpRequest = new XMLHttpRequest();
        httpRequest.callbackdata = callback;
        httpRequest.onreadystatechange = OnHttpRequestChange;
        
        httpRequest.open(metodo, './FileLoader/httpRequest.php?' + llamado);        
        httpRequest.send(JSON.stringify(data)); 
    }

    this.colocarJSONData = (llamado, callback, data) =>
    {
        doHttpRequest('POST', llamado, callback, data);
    }

    this.ObtenerJSONData = (fileName, callback) =>
    {                
        var httpRequest = new XMLHttpRequest();
        httpRequest.callbackdata = callback;
        httpRequest.onreadystatechange = OnHttpRequestChange;
        
        httpRequest.open('GET', './db/' + fileName + '.json');        
        httpRequest.send(); 
    }     

    return this;
});