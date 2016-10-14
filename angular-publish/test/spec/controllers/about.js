'use strict';

describe('Controller: HeaderCtrl', function () {

  // load the controller's module
  beforeEach(module('fgadmin'));

  var AboutCtrl,scope, commonService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $location,commonService) {
    scope = $rootScope.$new();
    AboutCtrl = $controller('HeaderCtrl', {
      $scope: scope,
      commonService:commonService
    });
  }));

  it('should check the parent tab length to be 3', function () {
   
    expect(scope.parentTabs.length).toBe(3);
  });
});
