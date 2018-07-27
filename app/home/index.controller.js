(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller)
        .filter('formatTime', function ($filter) {
                return function (time, format) {
                    var parts = time.split(':');
                    var date = new Date(0, 0, 0, parts[0], parts[1], parts[2]);
                    return $filter('date')(date, format || 'h:mm');
                };
            });

    function Controller(UserService, $scope, $http) {
        var vm = this;

        vm.user = null;

        initController();

        $scope.clear = function (form) {
            form.date = form.time = form.litres = form.percentage = null;
        }

        $scope.save = function (form) {
            var data = {
                user: vm.user.username,
                date: form.date,
                time: form.time,
                litres: form.litres,
                percentage: form.percentage
            }

            $http.post('/api/users/new/aggregator', data)
                .then(function (res, err) {
                    form = null;
                    console.log(res);
                    console.error(err);
                })
        }

        $scope.viewAll = function () {
            $http.get('/api/users/all').then(function (res) {
                $scope.allData = res.data;
            });
        }

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }
    }

})();