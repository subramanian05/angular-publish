# angular-publish

An Angular admin(publishing) tool that displays announcements , links used by a website , and any changes you make to these entities will reflect on the actual website.  

The following features are used 

1. uses ng-route for routing
2. Bootstrap datetime picker 
3. Ng-grid for displaying a table containing history of announcements
4. Used textAngular for editing html content for announcements.
5. used ui-select to display visually appealing multi select component. 


Challenges:

1. This project displays the ability to make ajax calls prior to the config phase . The way it achieves it is to call angular.injector to obtain $http service , before even calling angular.module to init the modules,  . The it makes a call to a java rest service, that returns what navigation elements are authorized for this user. 

2. Then we use the $routeProvider to initialize the necessary routes for all those nav elements which the user was authorized.

3. To delay the bootstrapping of application , we should remove the ng-app attribute from html page, and use angular.bootstrap when the $http service promise is resolved.


