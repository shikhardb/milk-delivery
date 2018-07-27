(function () {
    'use strict';

    angular
        .module('app')
        .controller('All.IndexController', Controller);

    function Controller($scope, $http) {
        $http.get('/api/users/all').then(function(res) {
            console.log(res);
        })
    }

})();