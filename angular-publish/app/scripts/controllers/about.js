'use strict';

/**
 * @ngdoc function
 * @name mytodoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the mytodoApp
 */
angular.module('fgadmin')
  .controller('HeaderCtrl' , ['$rootScope','$scope', '$location','commonService', function($rootScope,$scope, $location, commonService){
  		$scope.parentTabs=commonService.getParentTabs();
  		

		$scope.isActive = function (parentTab) {
			var bool=false;
			if($location.path()==='/' && $scope.parentTabs && $scope.parentTabs.length>1 ){
				if(parentTab.name === $scope.parentTabs[0].name){
					return true;
				}
			}else if($location.path()==='/' && $scope.parentTabs && $scope.parentTabs.length===1){
				return true;
			}
			
			for (var i = 0; i < parentTab.children.length; i++) {
				if($location.path().indexOf(parentTab.children[i].url)===0){
					bool=true;
				}
			}
			return bool;
		};


  }]);
