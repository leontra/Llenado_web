define(function (require) 
{
    // Load any app-specific modules
    // with a relative require call,
    // like:    
    require('./request');
    
    var eventListeners = require('./eventListeners');

    eventListeners.Initialize();
});