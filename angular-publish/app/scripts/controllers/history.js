angular.module('fgadmin')
	.controller('HistoryCtrl', ['$rootScope','$scope','$location','linkService','notificationRestServices', 
		'$filter','$modal','commonService','$appConfig','$timeout','$q',
		function ($rootScope,$scope, $location, linkService, notificationRestServices, $filter , $modal, commonService, $appConfig, $timeout, $q) {

			var Util={};
			Util.preprocess = function(anns, $scope){
				angular.forEach(anns, function(ann){
					if(ann.audience && ann.audience.ruleSet){
						ann.audience.ruletext1 = (function(ruleSet){

							return $scope.audience.all.filter(function(el){
								if(ruleSet.indexOf(el.rule)!==-1){
									return el;

								}
							});


						})(ann.audience.ruleSet, $scope);



						ann.audience.ruletext2 = (function(ruleSet){

							return $scope.ents.all.filter(function(el){
								if(ruleSet.indexOf(el.rule)!==-1){
									return el;

								}
							});


						})(ann.audience.ruleSet, $scope);
					}
				});

				return anns;
			};

			$scope.getOrgIds= function(id) {
					if(id){
						 notificationRestServices.getAnnouncement(id).success(function(data){
		               		alert(data.audience.orgIds);
		            	 });
					}
			       
			 };

			

			$scope.gridOptions = {
				 paginationPageSizes: [25, 50, 75],
    			 paginationPageSize: 25,
			};
			$scope.gridOptions.data = 'anns';
			$scope.gridOptions.enableColumnResizing = true;
			$scope.gridOptions.enableFiltering = true;
			$scope.gridOptions.enableGridMenu = false;
			$scope.gridOptions.showGridFooter = false;
			$scope.gridOptions.showColumnFooter = false;
			$scope.gridOptions.fastWatch = true;

			$scope.gridOptions.rowIdentity = function(row) {
				return row.id;
			};
			$scope.gridOptions.getRowIdentity = function(row) {
				return row.id;
			};

			$scope.gridOptions.columnDefs = [
			{ name:'id', width:100 },
			{ name:'Type', field:'typeCode', width:100 },
			{ name:'Title', field:'title', width:100 },
			{ name:'Body', field:'text', width:150 },
			{ name:'Activation Date',field:'activation', cellFilter:'date', width:150, type:'date', enableFiltering:false },
			{ name:'Expiration Date',field:'expiration', cellFilter:'date', width:150, type:'date', enableFiltering:false },
			{ name:'Firm Crd#', field:'id',width:150, enableCellEdit: false ,enableFiltering:false ,
			 cellTemplate:'<button class="btn btn-primary btn-xs" ng-click="grid.appScope.getOrgIds(COL_FIELD)">Firm IDs</button>'}, 
			
			{ name:'Audience', field:'audience.ruletext1',width:150, enableCellEdit: false 
				, cellFilter:'arrayFilter:this'
				, filter: {
		          condition: function(searchTerm, cellValue) {		           
		            return searchTerm && cellValue && $filter('arrayFilter')(cellValue).toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0;
		          }
		        }
    		},
			{ name:'Entitlements', field:'audience.ruletext2',width:150, enableCellEdit: false
				, cellFilter:'arrayFilter:this'
				, filter: {
		          condition: function(searchTerm, cellValue) {		           
		             return searchTerm && cellValue && $filter('arrayFilter')(cellValue).toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0;
		          }
		        } 
		    },
			{ name:'Urgent',field:'urgent', width:150 }
			
			];


			$scope.init = function(){
				$scope.ents={};
				$scope.ents.all = linkService.AUDIENCE().ents.all;

				$scope.audience={};
				$scope.audience.all =linkService.AUDIENCE().audience.all;
				commonService.reset();
				$scope.$appConfig=$appConfig;         
				angular.forEach($scope.$appConfig, function(val, key){
					var parentTab={};
					parentTab.name=key;
					parentTab.children=val;
					commonService.addParentTab(parentTab);
				});
			};

			$scope.getParams = function(){
				var params={};
				var parentTabs=commonService.getParentTabs();

				angular.forEach(parentTabs, function(parentTab){

					for (var i = 0; i < parentTab.children.length; i++) {
						if($location.path().indexOf(parentTab.children[i].url)===0){
							params.app=parentTab.name==='Home'?'MI':'OATS';
							params.env=parentTab.name.indexOf('CT')>0?'CT':'PD';
							params.type=parentTab.children[i].tabTitle==='Announcements'?'FG_System_Announcements':parentTab.children[i].tabTitle;
							$scope.routePath=parentTab.children[i].url;

							break;
						}
					}

				});
				return params;

			};



			$scope.refresh = function(){

				$scope.panelType=$scope.getParams()['type']==='FG_System_Announcements'?'Announcements':$scope.getParams()['type'];


				notificationRestServices.getAnnouncementHist($scope.getParams()).success(function(data){

					$scope.anns=  Util.preprocess($filter('orderBy')(data, 'activation'), $scope);


				});

			};

			$scope.init();      
			$scope.refresh();

			

}]).filter('arrayFilter', function(){
	return function(value){
		if(value && value.length>0){
			
			var v= value.map(function(elem){
				return elem.name;
			}).join(",");

			
			return v;

		}else{
			return '';
		}

	};
});
