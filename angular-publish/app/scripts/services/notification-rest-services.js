angular.module('fgadmin.rest.services')
.factory('notificationRestServices', ['$http', '$location' ,'$q',function($http, $location, $q) {
  
  'use strict';

  var Links={};
  var DOMAIN_PREFIX='http://localhost:8080';
  Links.ANN_GET_URL='/rds/rest/v2/cm/announcement';
  Links.ANN_HIST_GET_URL='/rds/rest/v2/cm/announcement/hist';
  Links.ANN_GET_DRAFT_URL='/rds/rest/v2/cm/announcement/draft';
  Links.ANN_CUD_URL='/rds/rest/v2/cm/announcement/cud';
  Links.ANN_DRAFT_CUD_URL='/rds/rest/v2/cm/announcement/draft/cud';

  var FGLinks={};
  FGLinks.DEV="https://firms1.dev.finra.org";
  FGLinks.INT="https://firms1.int.finra.org";
  FGLinks.QA="https://firms1.qa.finra.org";
  FGLinks.PROD="https://firms.finra.org";

  var TYPE_MAP={'FG_System_Announcements':'FG', 'Hot Topics':'HT', 'System Announcements':'SA'}

  var init = function(){
    if($location.host().indexOf('localhost')>=0 || $location.host().indexOf('3j3pyw1')>=0){
      for(var x in Links){
        Links[x]=DOMAIN_PREFIX+Links[x];
      }
    }


  };
  
  init();

  var publishAnnouncements = function(data){
    return $http.post(Links.ANN_CUD_URL,data);
  };

   var getAnnouncements = function(arg) {

    return $http.get(Links.ANN_GET_URL+"/"+arg.app+"/"+arg.env+"?type="+arg.type, {cache:false});

   };

  var getAnnouncementHist = function(arg) {

    return $http.get(Links.ANN_HIST_GET_URL+"/"+arg.app+"/"+arg.env+"?type="+arg.type, {cache:false});

   };

    var getAnnouncement = function(id) {

    var url=Links.ANN_GET_URL +'/'+id;

    return $http.get(url, {cache:false});

   };

   var getFGLink = function(){
    for(var y in FGLinks){
      if($location.host().indexOf('localhost')>=0 || $location.host().indexOf('3j3pyw1')>=0 ){
        return FGLinks.DEV;
      }else{
       var  words=$location.host().match(/\w+/g);
       if(words.length==4){
          return FGLinks.PROD;
       }else{
         return FGLinks[words[2].toUpperCase()];
       }
      }
    }
   };

   var getDraftAnnouncements = function(arg){
     
      var type=TYPE_MAP[arg.type];

      var deferred=$q.defer();

      $http.get(Links.ANN_GET_DRAFT_URL+"/"+type, {cache:false}).success(function(data){

         deferred.resolve(data.map(function(noti){
            var ann=angular.fromJson(noti.json);
            ann.wfl={};
            ann.wfl.id=noti.notificationWorkFlowId;
            ann.wfl.type=noti.workFlowType;
            ann.wfl.state=noti.workFlowState;
            ann.wfl.createUser=noti.createUser;
            ann.wfl.createDate=noti.createDate;
            ann.wfl.updateDate=noti.updateDate;
            return ann;
            
         }));

      });

      return deferred.promise;
   };

   var publishDraftAnnouncements = function(data, arg){
    var type=TYPE_MAP[arg.type];
    var id=undefined;
    var status='DRAFT';
    if(data.u && data.u.length>0){
      id=data.u[0].wfl.id;
      status=data.u[0].wfl.state;
      delete data.u[0].wfl;
    }else if(data.d && data.d.length>0){
       id=data.d[0].wfl.id;
       delete data.d[0].wfl;
    }

    return $http.post(Links.ANN_DRAFT_CUD_URL+"?type="+type+"&id="+id+"&status="+status,data);
  };



  

  return {    	
    getAnnouncementHist:getAnnouncementHist,
    getAnnouncements:getAnnouncements,
    getAnnouncement:getAnnouncement,
    publishAnnouncements:publishAnnouncements,
    getFGLink:getFGLink,
    getDraftAnnouncements:getDraftAnnouncements,
    publishDraftAnnouncements:publishDraftAnnouncements
  
  };
}]);