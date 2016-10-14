angular.module('fgadmin.rest.services', [])
.factory('linkService', ['$http', '$location' ,function($http, $location) {
  
  'use strict';
  var Links={};
  var DOMAIN_PREFIX='http://localhost:8080';
  Links.LINK_GET_EDU_URL = '/rds/rest/v2/cm/link-group/type/mi_home_webinars';
  Links.LINK_GET_RES_URL = '/rds/rest/v2/cm/link-group/type/mi_home_resources';      
  Links.LINK_GET_OATSRES_URL_PD='/rds/rest/v2/cm/link-group/type/mi_oats_resources_pd';  
  Links.LINK_GET_OATSRES_URL_CT='/rds/rest/v2/cm/link-group/type/mi_oats_resources_ct';  
  Links.LINK_UPDATE_URL='/rds/rest/v2/cm/link-group/:id'  ; 

  var FGLinks={};
  FGLinks.DEV="https://firms1.dev.finra.org";
  FGLinks.INT="https://firms1.int.finra.org";
  FGLinks.QA="https://firms1.qa.finra.org";
  FGLinks.PROD="https://firms.finra.org";

  var init = function(){
    if($location.host().indexOf('localhost')>=0 || $location.host().indexOf('3j3pyw1')>=0){
      for(var x in Links){
        Links[x]=DOMAIN_PREFIX+Links[x];
      }
    }


  };
  
  init();

  var AUDIENCE = function(){
      var root={};

      root.ents={};
      root.audience={};
      root.audience.all=[
          { name :'Active Registered Firm' ,desc:'All approved , suspended or TERMREQUEST firms', rule: '<and> <test name=\"nasdOrgClass\" operator=\"contains\" value=\"FIRM\"/> <or> <test name=\"FirmStatus\" operator=\"contains\" value=\"APPROVED\"/> <test name=\"FirmStatus\" operator=\"contains\" value=\"SUSPENDED\"/> <test name=\"FirmStatus\" operator=\"contains\" value=\"TERMREQUEST\"/> </or> </and> '},
            { name :'Applicant' , desc:'Firms who are Pending or Withdrawn Requested status,',rule: '<and><test name=\"nasdOrgClass\" operator=\"contains\" value=\"FIRM\"/> <or> <test name=\"FirmStatus\" operator=\"contains\" value=\"PENDING\"/> <test name=\"FirmStatus\" operator=\"contains\" value=\"WDRQSTD\"/> </or> </and> '},
              { name :'FINRA Call Center' , desc:'FINRA Entitlement Support Group , who has nasdPrivMIFrmSprt entitlement', rule: '<and> <test name=\"nasdPrivMIFrmSprt\" operator=\"contains\" value=\"use\" /> </and>' },
                { name :'FINRA User' , desc:'Firms whose EWS Org class is NASD', rule: '<and> <test name=\"nasdOrgClass\" operator=\"contains\" value=\"NASD\"/> </and> '},
                  { name :'Service Bureaus' , desc: 'Firms whose EWS Org class is OTHER', rule: '<and> <test name=\"nasdOrgClass\" operator=\"contains\" value=\"OTH\"/> </and> '}
        ];
      root.ents.all=[ 
          {
            'name':'Annual Audit',
            'rule':'nasdPrivAnnualAudit'
          },
          {
            'name':'CRD',
            'rule':'nasdPrivCRD'
          },
          {
            'name':'Customer Margin Balance',
            'rule':'nasdPrivFormR1Sbmt'
          },
          {
            'name':'eFOCUS Application',
            'rule':'nasdPriveFOCUS'
          },
          {
            'name':'FINRA Waiver System',
            'rule':'nasdPrivFWF'
          },
          {
            'name':'FINRA Waiver System',
            'rule':'nasdPrivFWS'
          },
          {
            'name':'Firm Clearing Arrangements',
            'rule':'nasdPrivFFCAF'
          },
          {
            'name':'IARD',
            'rule':'nasdPrivIARD'
          },
          {
            'name':'IR - Central Review Group Requests',
            'rule':'nasdPrivFormCRGR'
          },
          {
            'name':'IR - Information Request Forms',
            'rule':'nasdPrivIRF'
          },
          {
            'name':'IR - Secure Request Manager',
            'rule':'nasdPrivSRM'
          },
          {
            'name':'IR - Web IR',
            'rule':'nasdPrivIR'
          },
          {
            'name':'New Member Application',
            'rule':'nasdPrivNMA'
          },
          {
            'name':'Next Gen New Member Application',
            'rule':'nasdPrivNGNMA'
          },
          {
            'name':'NYSE407A',
            'rule':'nasdPrivNR407AF'
          },
          {
            'name':'OATS Application',
            'rule':'nasdPrivOATS'
          },
          {
            'name':'Private Placement',
            'rule':'nasdPrivPrivatePlacement'
          },
          {
            'name':'Public Offerings Filings',
            'rule':'nasdPrivCOBRA'
          },
          {
            'name':'Quarterly 351(e) Filings ',
            'rule':'nasdPriv351EAttestation'
          },
          {
            'name':'Reg - 17a-11 Financial Notifications',
            'rule':'nasdPrivFMR17a11'
          },
          {
            'name':'Reg - 3012 Claim for Exception',
            'rule':'nasdPrivFMR3012'
          },
          {
            'name':'Reg - 4530 Disclosure and Complaints -- Rule 4530(abd) ',
            'rule':'nasdPrivCCS'
          },
          {
            'name':'Reg - 4530 Legal Filings -- Rule 4530(fg) ',
            'rule' :'nasdPrivCCS'
          },
          {
            'name':'Reg - Advertising Regulation',
            'rule':'nasdPrivADV'
          },
          {
            'name':'Reg - FINRA Contact System',
            'rule':'nasdPrivNCS'
          },
          {
            'name':'Reg - FOCUS',
            'rule':'nasdPrivWFS'
          },
          {
            'name':'Reg - INSITE Firm Data Filing',
            'rule':'nasdPrivFDF'
          },
          {
            'name':'Reg - Reg T and 15C3-3 Ext',
            'rule':'nasdPrivRGT'
          },
          {
            'name':'Reg - Short Position Reporting',
            'rule':'nasdPrivFFS'
          },
          {
            'name':'Regulation M Notifications',
            'rule':'nasdPrivRegMNotification'
          },
          {
            'name':'Report Center',
            'rule':'nasdPrivSCRC'
          },
          {
            'name':'Subordinated Loans',
            'rule':'nasdPrivSubloans'
          },
          {
            'name':'TRACE New Issue Form',
            'rule':'nasdPrivTRACENIF'
          },
          {
            'name':'TRACE Order Form',
            'rule':'nasdPrivTRACEOF'
          },
          {
            'name':'Trading Activity Fee',
            'rule':'nasdPrivTAF'
          }
        ];

      angular.forEach(root.ents.all , function(el){
        var tpl='<and> <test name=\"[ENT]\" operator=\"contains\" value=\"use\"/> </and> ';
        el.rule=tpl.replace('[ENT]',el.rule )

      })

     return root;
    
  }

 
  var getLinks = function(type) {

  	var url='';
    if(type==='E'){
      url=Links.LINK_GET_EDU_URL;
    }else if(type==='R'){
       url=Links.LINK_GET_RES_URL;
    }else if(type==='OR-PD'){
       url=Links.LINK_GET_OATSRES_URL_PD;
    }else if(type==='OR-CT'){
      url=Links.LINK_GET_OATSRES_URL_CT;
    }
 
  	
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



  var updateLinks = function(data) {

  	var url=Links.LINK_UPDATE_URL.replace(':id', data.id);  
    return $http.put(url, data);
  };


  var getConfig = function(){
    return $http.get('/config.json', {cache:false});
  }

  

  

  return {    	
    updateLinks:updateLinks,
    getLinks:getLinks,
    getFGLink:getFGLink,
    getConfig:getConfig,
    AUDIENCE:AUDIENCE
  };
}]);