'use strict';

/**
 * @ngdoc overview
 * @name fgadmin
 * @description
 * # fgadmin
 *
 * Main module of the application.
 */




(function(ng, $){
  var configData;
  var configDataExternal;
  var mock=false;
  var URL='http://enterprise.[ENV]finra.org/app-rds/restful-services/app-config/FGAdmin';
  //dict (short for dictionary)
  var dict=function(name){    
    var DICT={'Education':'home', 'Resources':'home', 'OATS Resources':'home', 'System Announcements':'announcements', 'Hot Topics':'announcements'};
    return DICT[name] || name;
  };

  var urlDict = function(url){
    var hostname=window.location.hostname;

    if(hostname.indexOf('qa') > 0) {
      url = url.replace('[ENV]','qa.');
    } else if(hostname.indexOf('.int') > 0 ) {
      url = url.replace('[ENV]','int.');
    }else if(hostname.indexOf('dev') > 0 ) {
      url = url.replace('[ENV]','dev.');
    } else if(hostname.indexOf('localhost') >= 0) {
      url = url.replace('[ENV]','dev.');
      if(mock){
        url='/config2.json';
      }
    } else {
      url = url.replace('[ENV]','');
    }
    return url;

  };

 
  ng.module('fgadmin', [
              'ngAnimate',
              'ngCookies',
              'ngResource',
              'ngRoute',
              'ngSanitize',
              'ngTouch',
              'ui.bootstrap',
              'ui.bootstrap.datetimepicker',
    
              'textAngular',
              'ui.select',
              'ui.grid', 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.pinning', 'ui.grid.selection', 'ui.grid.moveColumns', 'ui.grid.exporter', 'ui.grid.importer', 'ui.grid.grouping','ui.grid.pagination',
              'fgadmin.rest.services'
            ]);


  var parseResponse=function (response){
       if(!response)return;
       configDataExternal=response;
       ng.module('fgadmin').config(['$routeProvider', '$httpProvider',function ($routeProvider, $httpProvider) {

             
                      $httpProvider.defaults.cache = false;
                      if (!$httpProvider.defaults.headers.get) {
                        $httpProvider.defaults.headers.get = {};
                      }
                      //disable IE ajax request caching
                      $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
                      // extra
                      $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
                      $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
                      delete $httpProvider.defaults.headers.common['X-Requested-With'];


                     function translate(json){
                        var temp={};

                         ng.forEach(json.navItems, function(navItem){

                           temp[navItem.label]=[];

                            ng.forEach(navItem.banner, function(el){

                              temp[navItem.label].push({name:el.label, url:el.url});     

                            });

                        });

                        return temp;

                      }

                      function process(configData, i){
                        if(configData.hasOwnProperty(i)){
                               configData[i].forEach(function (el){
                                  $routeProvider.when(el.url, props(el));
                                  $routeProvider.when(el.url+'/history', {
                                     templateUrl:'views/history.html',
                                     controller: 'HistoryCtrl',
                                     resolve:{
                                      $appConfig: function(){return configData;}
                                     }
                                  });
                               }); 
                        }
                     }

                     

                     configData=translate(configDataExternal);
                     
                    
               
                     for (var i in configData) {    
                          process(configData, i);
                       
                     }

                     $routeProvider
                            .when('/', {
                              templateUrl: 'views/home.html',
                              controller: 'HomeCtrl',
                             resolve:{
                              $appConfig: function(){return configData;}
                             }
                         }); 
                     $routeProvider.otherwise({
                          redirectTo: '/'
                     });


               

                   function props(el){
                    el.tabTitle=el.name;
                    el.name=dict(el.name);
                    return {
                      templateUrl:'views/'+ el.name.toLowerCase().replace(/\s/g, '')+'.html',
                      controller: el.name[0].toUpperCase()+el.name.substring(1)+'Ctrl',
                      resolve:{
                        $appConfig: function(){return configData;}
                      }
                    };
                   }


                  

                   
              }]);
   };

  

  

    fetchData().then(bootstrapApplication);

    function fetchData() {
        var inj = angular.injector(['ng']);
      
       
        var $http = inj.get('$http');

        var $q = inj.get('$q');
        var def=$q.defer();

        $http.jsonp(urlDict(URL)+'?callback=JSON_CALLBACK').then(function(response) {
           if(console && console.log){console.log('success load config');}
            def.resolve(response);
        }, function(errorResponse) {
            if(console && console.log){console.log('failed ajax request , to load config');}
             $http.jsonp(urlDict(URL)+'?callback=JSON_CALLBACK').then(function(response) {
                 if(console && console.log){console.log('success load config');}
                  def.resolve(response);

              }, function(errorResponse) {
                  if(console && console.log){console.log('failed ajax request , to load config');}
               
              });
           
         
        });

        return def.promise;
       

        
    }

    function bootstrapApplication(response) {
        parseResponse(response.data);
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['fgadmin']);
        });
    }

  
   
    

 

})(window.angular, window.jQuery);

