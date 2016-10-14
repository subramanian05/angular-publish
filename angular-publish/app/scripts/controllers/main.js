'use strict';

/**
 * @ngdoc function
 * @name mytodoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mytodoApp
 */
angular.module('fgadmin')
  .controller('HomeCtrl', ['$scope','$location','linkService', '$modal', '$log','$filter','$window','$appConfig','commonService','Utils',
    function ($scope, $location, linkService, $modal, $log, $filter, $window, $appConfig, commonService, Utils) {
        

       

        var IMAGE_URL_SUFFIX='<img src=\'/firm-gateway/images/icon_new2.gif\'/>';
        $scope.selectedLinkIndex=0;

        $scope.isSelected = function(index){
        return $scope.selectedLinkIndex===index;

       };

      


       $scope.init = function(){
         commonService.reset();
         $scope.$appConfig=$appConfig;         
          angular.forEach($scope.$appConfig, function(val, key){
            var parentTab={};
            parentTab.name=key;
            parentTab.children=val;
            commonService.addKey(key);
            commonService.addParentTab(parentTab);
          });
        
       };

        $scope.refresh = function(){
          $scope.fgLink=linkService.getFGLink();
          commonService.getParentTabs();

          var linkType='';
            if($location.path().indexOf('education')>0 || ($location.path()==='/' && commonService.getKeys() && commonService.getKeys().indexOf('Home')  !== -1) ){
                linkType='E';
                $scope.panelType='Education';
            }else if($location.path().indexOf('/oats')>=0 ||  ($location.path()==='/' && commonService.getKeys() && commonService.getKeys().join('').indexOf('OATS')  !== -1) ){
              if($location.path().indexOf('pd')>0 || $location.path()==='/') {
                  linkType='OR-PD';
                  $scope.panelType='OATS Resource (PD)';
              }else{
                linkType='OR-CT';
                $scope.panelType='OATS Resource (CT)';
              }
              
             
            }else{
               linkType='R';
               $scope.panelType='Resource';
            }
            linkService.getLinks(linkType).success(function(data){
                  $scope.linkGroup=data;
                  $scope.linkGroup.links=$filter('orderBy')(data.links, 'linkPosition');

                

                  angular.forEach( $scope.linkGroup.links, function(link){
                    var title=link.title;
                    if(title && title!=='' ){
                      var index=title.indexOf('<img');
                     
                      if(index!==-1){
                        link.title=title.substring(0,index);                
                        link.hasImage=true;
                      }else{
                        link.hasImage=false;
                      }
                      
                    }

              
                  });

             
           
                $scope.selectedLinkIndex=0;

                $scope.masterTemp=angular.copy($scope.linkGroup);
                $scope.master={};
                if($scope.masterTemp && $scope.masterTemp.links && $scope.masterTemp.links.length){
                   for(var i=0;i<$scope.masterTemp.links.length; i++){
                    $scope.master[$scope.masterTemp.links[i].linkId]=$scope.masterTemp.links[i];

                  }
                }
               

           

          });
        };

        $scope.init();

        $scope.refresh();

        

      

       
       $scope.selectLink = function(index, flag,$event ){
          if($event){
            $event.preventDefault();
          }

          if(flag){
            return;
          }


         

       
          $scope.selectedLinkIndex=index;
         
       };
      	
        $scope.addLink = function (flag) {
          if(flag){
            return;
          }

          var linkPos=1;

          if($scope.linkGroup.links && $scope.linkGroup.links.length>0){
            linkPos=$scope.linkGroup.links[$scope.linkGroup.links.length-1].linkPosition+1;
          }

          var link={linkId:null , title:'[Enter Title]', url:'', linkPosition:linkPos};
      		$scope.linkGroup.links.push(link);
          $scope.selectLink($scope.linkGroup.links.length-1);
      	
        };

         $scope.removeLink = function (link) {
          $scope.links.pop(link);          
        };

        $scope.deleteLink = function(index, flag){
          if(flag){
            return;
          }
          $scope.selectLink(index);
          var link=$scope.linkGroup.links[index];
          link.deleted=true;
          link.important=true;
          link.error=true;
        };

        $scope.moveUp = function(index, flag){
          if(flag){
            return;
          }

           var temp=$scope.linkGroup.links[index].linkPosition;
           var tempLink=$scope.linkGroup.links[index];

           $scope.linkGroup.links[index].linkPosition=$scope.linkGroup.links[index-1].linkPosition;
           $scope.linkGroup.links[index-1].linkPosition=temp;

           $scope.linkGroup.links[index]=$scope.linkGroup.links[index-1];
           $scope.linkGroup.links[index-1]=tempLink;
             $scope.selectLink(index-1);

        };

        $scope.moveDown = function(index, flag){
          if(flag){
            return;
          }

           var temp=$scope.linkGroup.links[index].linkPosition;
           var tempLink=$scope.linkGroup.links[index];

           $scope.linkGroup.links[index].linkPosition=$scope.linkGroup.links[index+1].linkPosition;
           $scope.linkGroup.links[index+1].linkPosition=temp;

           $scope.linkGroup.links[index]=$scope.linkGroup.links[index+1];
           $scope.linkGroup.links[index+1]=tempLink;
           $scope.selectLink(index+1);

          
        };

        $scope.setImage = function(){

          $scope.linkGroup.links[$scope.selectedLinkIndex].hasImage=!$scope.linkGroup.links[$scope.selectedLinkIndex].hasImage;

        };

         $scope.openWin = function(index, flag,$event){
          if(flag){
            if($event){
              $event.preventDefault();
            }
            return;
          }
          $scope.selectLink(index,flag,$event);

          $window.open($scope.linkGroup.links[$scope.selectedLinkIndex].url, '_blank');


        };




       

        $scope.open = function () {

          var modalInstance = $modal.open({
            templateUrl: 'views/modal-links.html',
            controller: 'ModalInstanceCtrl',
            size: 'md',
            resolve: {
              data: function () {
                return $scope.modalData;
              }
            }
          });

          modalInstance.result.then(function () {
             linkService.updateLinks($scope.linkGroup).then(function(){
          
              $scope.linkGroup.links=[];
              $scope.refresh();
             }, function(res){
              $scope.alerts=Utils.alerts(res);
              $scope.linkGroup=$scope.linkgroupRestore;
              $scope.linkgroupRestore=undefined;
            });

          }, function () {
            $log.info('Modal dismissed at: ' + new Date());
            $scope.linkGroup.links=[];
            $scope.refresh();
          });
        };


        $scope.publish= function(){

         
          var finalLinks=[];
          $scope.modalData={};
          $scope.modalData.del=0;
          $scope.modalData.adds=0;
          $scope.modalData.updates=0;

          $scope.linkgroupRestore= angular.copy($scope.linkGroup);

          $scope.alerts=undefined;

          angular.forEach($scope.linkGroup.links, function(link){
            if(!link.deleted ){
             

              if(link.linkId===null || link.linkId===undefined){
                $scope.modalData.adds=$scope.modalData.adds+1;
              }else{
                
                if(!angular.equals($scope.master[link.linkId], link)){
                    $scope.modalData.updates=$scope.modalData.updates+1;
                }
              
              }

              if (link.hasImage){
                link.title=link.title+IMAGE_URL_SUFFIX;
               
              }

              delete link.hasImage;

              finalLinks.push(link);
            }else{
              $scope.modalData.del=$scope.modalData.del+1;
            }

          });

          

          $scope.linkGroup.links=finalLinks;

          $scope.open();
          
         
         
      };

      //Used by AlertController
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };




     
  }]).controller('ModalInstanceCtrl', ['$scope','$modalInstance','data',function ($scope, $modalInstance, data) {

    $scope.data = data;
    
    $scope.ok = function () {
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
}]).directive('restoreIfInvalid', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ctrl) {
            scope.oldVal='';
           
            scope.$watch(attr.ngModel, function(newVal, oldVal) {
                if(oldVal){scope.oldVal=oldVal;}else{if(newVal){scope.oldVal=newVal;}}
            });
            ctrl.$parsers.push(function (newVal) {
                console.log(newVal);
                if (newVal!=='') {
                    ctrl.$setValidity('unique', true);
                    return newVal; // Return the new valid value.
                }
                ctrl.$setValidity('unique', false);
               
                return scope.oldVal;
                //return $scope.oldValues.slice(-1); // Model is not valid so return undefined.
            });
        }
    };
});
