'use strict';

/**
 * @ngdoc function
 * @name mytodoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mytodoApp
 */
angular.module('fgadmin')
.controller('AnnouncementsCtrl', ['$rootScope','$scope','$location','linkService','notificationRestServices', '$filter','$modal','commonService','$appConfig','$timeout','$q',
                                  function ($rootScope,$scope, $location, linkService, notificationRestServices, $filter , $modal, commonService, $appConfig, $timeout, $q) {



	$scope.anns=[];
	$scope.master=[];
	$scope.annsd=[];
	$scope.masterd=[];
	//$scope.model={};


	var Util={};



	$scope.init = function(){

		$scope.editText='Edit';
		$scope.mode="Published";//Draft
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

		$scope.fgLink=linkService.getFGLink();


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


		notificationRestServices.getAnnouncements($scope.getParams()).success(function(data){

			$scope.anns=$filter('orderBy')(data, 'activation');
			Util.preprocess($scope.anns, $scope);
			$scope.master=angular.copy($scope.anns);
			$scope.selectedIndex=0;
			$scope.model=$scope.anns[0];
			$scope.publishStatus='Publish';
			if($scope.model){
				$timeout(function(){
					$scope.selectedDraftIndex=undefined;
				}, 1000)   
			}else{
				$scope.selectedDraftIndex=0;
				$scope.selectedIndex=undefined;
				$scope.model=$scope.annsd[0];
			}


		});

	};

	$scope.refreshDrafts = function(index){


		notificationRestServices.getDraftAnnouncements($scope.getParams()).then(function(data){

			$scope.annsd=$filter('orderBy')(data, 'activation');
			Util.preprocess($scope.annsd, $scope);
			$scope.masterd=angular.copy($scope.annsd);
			$scope.selectedDraftIndex=index;
			$scope.model=$scope.annsd[$scope.selectedDraftIndex];
			$scope.publishDraftStatus="Save Draft";
			if($scope.model){
				$timeout(function(){
					$scope.selectedIndex=undefined;
				}, 1000)   
			}else{
				$scope.selectedIndex=0;
				$scope.selectedDraftIndex=undefined;
				$scope.model=$scope.anns[0];
			}




		});


	}

	$scope.refreshAll = function(){
		$scope.panelType=$scope.getParams()['type']==='FG_System_Announcements'?'Announcements':$scope.getParams()['type'];
		$q.all([notificationRestServices.getAnnouncements($scope.getParams()), 
		        notificationRestServices.getDraftAnnouncements($scope.getParams())]).then(function(data){

		        	$scope.anns=$filter('orderBy')(data[0].data, 'activation');
		        	Util.preprocess($scope.anns, $scope);
		        	$scope.master=angular.copy($scope.anns);
		        	$scope.selectedIndex=0;
		        	$scope.model=$scope.anns[0];
		        	$scope.publishStatus='Publish';


		        	$scope.annsd=$filter('orderBy')(data[1], 'activation');
		        	Util.preprocess($scope.annsd, $scope);
		        	$scope.masterd=angular.copy($scope.annsd);
		        	$scope.selectedDraftIndex=undefined;                  
		        	$scope.publishDraftStatus="Save Draft";

                    if($scope.model){
                        $timeout(function(){
                            $scope.selectedDraftIndex=undefined;
                        }, 1000)   
                    }else{
                        $scope.selectedDraftIndex=0;
                        $scope.selectedIndex=undefined;
                        $scope.model=$scope.annsd[0];
                    }


		        });

	}


	$scope.init();
	$scope.refreshAll();

	/*$scope.$on('event.child.activation.change', function(event, message){
         //$log.log(message);
         $scope.anns[$scope.selectedIndex].activation = message;
        });

        $scope.$on('event.child.expiration.change', function(event, message){
         //$log.log(message);
           $scope.anns[$scope.selectedIndex].expiration = message;
       });*/

	$scope.isSelected = function(index){
		return $scope.selectedIndex===index;

	};

    $scope.refreshOrgList = function(model){
        if(model && model.id){
            notificationRestServices.getAnnouncement(model.id).success(function(data){
                if(model.audience && data.audience){
                    model.audience.orgIds=data.audience.orgIds;
                }else{

                }
            });
        }
    }


    $scope.reset = function(model){
        if(model.audience ){
                    model.audience.orgIds=[0];
         }
    }

	$scope.isDraftSelected = function(index){
		return $scope.selectedDraftIndex===index;
	}


	$scope.selectAnn = function(index, flag,$event){
		if($event){
			$event.preventDefault();
		}
		if(flag){
			return;
		}

		$scope.selectedIndex=index;
		$scope.selectedDraftIndex=undefined;
		$scope.model=$scope.anns[$scope.selectedIndex] ;



	};

	$scope.selectDraftAnn = function(index, flag,$event){
		if($event){
			$event.preventDefault();
		}
		if(flag){
			return;
		}

		$scope.selectedDraftIndex=index;
		$scope.model= $scope.annsd[$scope.selectedDraftIndex];
		$scope.selectedIndex=undefined;



	};

	$scope.addAnn = function () {
		//set id to make sure  the orderby filter will appropriately place the item
		//server does not need the id however
		var last;
		var newId=undefined;
		if($scope.anns && $scope.anns.length>0){
			last=$scope.anns[$scope.anns.length-1]
			if(last.new===true){
				return;
			}
			//newId=last.id+1;
		}
		var temp={
				id: newId,

				activation: new Date(),
				expiration: null,
				audience: {
					orgIds: [
					         0
					         ]
				},
			    location: [
				           null
				           ],
	           title: '[Enter Title]',
	           text: '[Enter Content]',
	           urgent: false,
	           typeId:generateUUID(),
	           new:true
		};

		function generateUUID() {
			var d = new Date().getTime();
			var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = (d + Math.random()*16)%16 | 0;
				d = Math.floor(d/16);
				return (c=='x' ? r : (r&0x3|0x8)).toString(16);
			});
			return uuid;
		};
		var params=$scope.getParams();
		params.typeCode=params.type;
		delete params.type;
		var ann=angular.extend({}, temp, params);
		console.log(ann);
		$scope.anns.push(ann);

		$scope.selectAnn($scope.anns.length-1);


	};

	$scope.setUrgent = function(){


		$scope.anns[$scope.selectedIndex].urgent=!$scope.anns[$scope.selectedIndex].urgent;

	};


	$scope.removeAnn = function (ann) {
		$scope.anns.pop(ann);          
	};

	$scope.deleteAnn = function(index, flag){
		if(flag){
			return;
		}
		$scope.selectAnn(index);

		if($scope.anns[index].new === true){
			delete $scope.anns[index];
			$scope.anns.length=$scope.anns.length-1;
			$scope.selectAnn(0);
		}else{
			$scope.anns[index].deleted=true;

		}


	};

	$scope.deleteDraftAnn = function(index, flag){
		if(flag){
			return;
		}
		$scope.selectDraftAnn(index);

		if($scope.annsd[index].new === true){
			delete $scope.annsd[index];
			$scope.annsd.length=$scope.annsd.length-1;
			$scope.selectDraftAnn(0);
		}else{
			$scope.list={};
			$scope.list.d=[];
			$scope.list.d.push(Util.processRules($scope.annsd[index]));
			notificationRestServices.publishDraftAnnouncements($scope.list, $scope.getParams()).then(function(){
				$scope.annsd=[];
				$scope.refreshDrafts(0);

			},Util.errorFunc);

		}


	};

	//Used by AlertController
	$scope.closeAlert = function(index) {
    	$scope.alerts.splice(index, 1);
  	};





	$scope.open = function (params) {

		var modalInstance = $modal.open({
			templateUrl: 'views/modal.html',
			controller: 'ModalInstanceCtrl',
			size: 'md',
			resolve: {
				data: function () {
					return $scope.modalData;
				}
			}
		});

		modalInstance.result.then(function () {
            $scope.modalData=undefined;
			if(params.mode==='Publish'){
				notificationRestServices.publishAnnouncements($scope.list).then(function(){

					$scope.anns=[];
					$scope.refresh();
				}, Util.errorFunc);

			}else if(params.mode==='Draft'){



				notificationRestServices.publishDraftAnnouncements($scope.list, $scope.getParams()).then(function(){
					$scope.annsd=[];               
					$scope.refreshDrafts(0);

				}, Util.errorFunc);

			}else if(params.mode=='Dual'){

				$scope.list2=angular.copy($scope.list);
				if(params.wfl){
					var cu= $scope.list2.c[0] || $scope.list2.u[0];
					cu.wfl=params.wfl;
					if($scope.list2.c[0]){
						$scope.list2.u[0]=angular.copy($scope.list2.c[0]);
						$scope.list2.c.length=0;
					}

				}
				$q.all([notificationRestServices.publishAnnouncements($scope.list),
				        notificationRestServices.publishDraftAnnouncements($scope.list2, $scope.getParams())]).then(function(){
				        	$scope.anns=[];
				        	$scope.annsd=[];
				        	$scope.refreshAll();
				        }, Util.errorFunc);               

			}

		}, function () {
			if($scope.modalData && params.mode==='Publish'){
				$scope.anns=[];
				$scope.refresh();

			}else if($scope.modalData && params.mode==='Draft'){
				$scope.annsd=[];
				$scope.refreshDrafts();
			}else if($scope.modalData && params.mode==='Dual'){
				$scope.annsd=[];
				$scope.refreshDrafts();

				$scope.anns=[];
				$scope.refresh();
			}
			$scope.publishStatus='Publish';
			$scope.publishDraftStatus='Save';
            $scope.modalData=undefined;

		});
	};



	$scope.publish= function(){


		$scope.list={};
		$scope.list.c=[];
		$scope.list.u=[];          
		$scope.list.d=[];



		$scope.publishStatus='Publishing...';

		if($scope.selectedIndex!==undefined){
			var ann=$scope.anns[$scope.selectedIndex];
			ann=Util.processRules(ann);
			if( ann.deleted ){
				delete ann.deleted;
				if(ann.new){
					delete ann.new;               
				}else{
					$scope.list.d.push(ann);
					$scope.modalData=angular.copy(ann);             
				}



			}else if(ann.new){
				delete ann.new;
				ann.id=null;
				$scope.list.c.push(ann);
				$scope.modalData=angular.copy(ann);

			}else{
				var master=Util.processRules($scope.master[$scope.selectedIndex]);
				if(!angular.equals(ann, master )){
					$scope.list.u.push(ann);
					$scope.modalData=angular.copy(ann);

				}
			}

			$scope.open({mode:'Publish'});

		}else{
			if($scope.annsd && $scope.annsd.length>0 ){
				var ann2= $scope.annsd[$scope.selectedDraftIndex];
				if(ann2){
					var ann2Copy=angular.copy(ann2);
					//we are publishing a draft as a publishable entity.

					if(ann2Copy.wfl){
						var wfl = angular.copy(ann2Copy.wfl)
						delete ann2Copy.wfl;
					}

					if(ann2.id===undefined || ann2.id===null){
						$scope.list.c.push(Util.processRules(ann2Copy));                                             
					}else{
						$scope.list.u.push(Util.processRules(ann2Copy));                                         
					}

					$scope.modalData=angular.copy(ann2Copy);
					wfl.state='PUBLISHED';  

					$scope.open({mode:'Dual', wfl:wfl }); 




				}
			}



		}








	};


	$scope.saveDraft= function(){


		$scope.list={};
		$scope.list.c=[];
		$scope.list.u=[];          
		$scope.list.d=[];



		$scope.publishDraftStatus='Saving...';

		if($scope.selectedDraftIndex!==undefined ){
			var ann=$scope.annsd[$scope.selectedDraftIndex];
			ann=Util.processRules(ann);
			if( ann.deleted ){
				delete ann.deleted;
				if(ann.new){
					delete ann.new;               
				}else{
					$scope.list.d.push(ann);
					$scope.modalData=angular.copy(ann);             
				}



			}else if(ann.new){
				delete ann.new;
				ann.id=null;
				$scope.list.c.push(ann);
				$scope.modalData=angular.copy(ann);

			}else{
				var master=Util.processRules($scope.masterd[$scope.selectedDraftIndex]);
				if(!angular.equals(ann, master )){
					$scope.list.u.push(ann);
					$scope.modalData=angular.copy(ann);

				}
			}

		}else{
			if($scope.anns && $scope.anns.length>0 ){
				var ann2= $scope.anns[$scope.selectedIndex];
				if(ann2){
					var ann2Copy=angular.copy(ann2);
					if(ann2.new){
						delete ann2Copy.new;
						$scope.anns.length=$scope.anns.length-1;
					}

					$scope.list.c.push(Util.processRules(ann2Copy));
					$scope.modalData=angular.copy(ann2Copy);



				}



			}
		}




		$scope.open({mode:'Draft'});


	};



	Util.processRules = function(ann)  {
		var ruleSet='';

		if(ann.audience.ruletext1){
			ruleSet=ruleSet+ ann.audience.ruletext1.map(function(elem){
				return elem.rule;
			}).join("");


		}

		if(ann.audience.ruletext2){
			ruleSet=ruleSet+ ann.audience.ruletext2.map(function(elem){
				return elem.rule;
			}).join("");

		}

		delete ann.audience.ruletext1;
		delete ann.audience.ruletext2;
		if(ruleSet!==''){
			ann.audience.ruleSet='<ATRules id=\"admin\"><Rule>'+ruleSet+'</Rule></ATRules>';
		}

		return ann;



	};

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
	}

	Util.regexPass = function(str){

		return true;

	};

	Util.errorFunc= function(res){
					console.log(res);
					if(res.data && res.data.indexOf('Fault: Invalid')>0){
						//$scope.anns=[];
				        //$scope.annsd=[];
				        //$scope.refreshAll();
				        $scope.publishStatus='Publish';
				        $scope.publishDraftStatus="Save Draft";
				        var message=res.data.match(/Invalid[A-Za-z\s]*\n/)[0];
				        var mes=message.substring(0, message.length-1);
						$scope.alerts=[
							{type: 'danger', msg:mes}
						];

					}else{
						$scope.alerts=[
							{type: 'danger', msg:'Your request is invalid or the server is unable to process your request.  '}
						];
					}
	};


	$scope.showContent = function($fileContent){      
		if(Util.regexPass($fileContent)){
			$fileContent=$fileContent.replace(/\t/g, '').replace(/\r\n/g, '');
			$scope.model.audience.orgIds = $fileContent.split(',');
		}

	};







} ]).controller('DateCtrl', [ '$scope',function ($scope) {

	/*$scope.today = function() {
          $scope.act_dt = new Date();
      };
      $scope.today();

      $scope.$on('event.activation.change', function(event, message){
         //$log.log(message);
         $scope.act_dt = message;
      });

   $scope.changeDt = function(){
        $scope.$emit("event.child.activation.change",$scope.act_dt);
    }*/



	$scope.clear = function () {
		$scope.anns[$scope.selectedIndex].activation=null; 
	};

	// Disable weekend selection
	$scope.disabled = function(date, mode) {
		return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	};

	$scope.toggleMin = function() {
		$scope.minDate = $scope.minDate ? null : new Date();
	};
	$scope.toggleMin();

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		$scope.opened = true;
	};



	$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
	};

	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	$scope.format = $scope.formats[1];


}]).controller('DateCtrl2', [ '$scope',function ($scope) {

	/*$scope.today = function() {
          $scope.exp_dt = new Date();
      };
      $scope.today();

      $scope.$on('event.expiration.change', function(event, message){
         //$log.log(message);
         $scope.exp_dt = message;
      });
      $scope.changeDt = function(){
        $scope.$emit("event.child.expiration.change",$scope.exp_dt);
      }
	 */



	$scope.clear = function () {
		$scope.anns[$scope.selectedIndex].expiration = null;
	};

	// Disable weekend selection
	$scope.disabled = function(date, mode) {
		return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	};

	$scope.toggleMin = function() {
		$scope.minDate = $scope.minDate ? null : new Date();
	};
	$scope.toggleMin();

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		$scope.opened = true;
	};

	$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
	};

	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	$scope.format = $scope.formats[1];


}]).directive('onReadFile', ['$parse', function ($parse) {
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, element, attrs) {
			var fn = $parse(attrs.onReadFile);
			element.fileReader({
				
				filereader : '/fg-admin/swf/filereader.swf'
				
				 
			});
			element.on('change', function(evt) {
				var reader = new FileReader();

				reader.onload = function(onLoadEvent) {
					scope.$apply(function() {
						fn(scope, {$fileContent:onLoadEvent.target.result});
					});
				}; 

				//console.log(evt.target.files[0].name, evt.target.files[0].type, evt.target.files[0].size, evt.target.files[0].lastModifiedDate);
				reader.readAsText((evt.srcElement || evt.target).files[0]);
			});
		}
	};
}]);