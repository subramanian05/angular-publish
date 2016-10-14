angular.module('fgadmin')
.factory('commonService', [function() {
  
  'use strict';

  var parentTabs=[];
  var keys=[];

 
  var getParentTabs = function() {

  	return parentTabs;

  };

  var addParentTab = function(tab){
    parentTabs.push(tab);
  };

 var addKey = function(key){
    keys.push(key);
  };

  var getKeys = function(){
   return keys;
  };


  var reset = function(){
    parentTabs.length=0;
  };


  return {    	
   addParentTab:addParentTab,
    getParentTabs:getParentTabs,
    reset:reset,
    addKey:addKey,
    getKeys:getKeys
  
  };
}]);