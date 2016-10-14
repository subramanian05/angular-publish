angular.module('fgadmin').factory('Utils',[ function(){

	return {

		alerts : function(res ){

					console.log(res);
					var alerts;
					if(res.data && res.data.indexOf('Fault: Invalid')>0){
						
				        var message=res.data.match(/Invalid[A-Za-z\s]*\n/)[0];
				        var mes=message.substring(0, message.length-1);
						alerts= [{type: 'danger', msg:mes}];

					}else{
						alerts=[{type: 'danger', msg:'Your request is invalid or the server is unable to process your request.  '}];
					}

					return alerts;

		}

	}

}]);