'use strict';

angular.module('trendngApp')
  .controller('GameCtrl', function ($scope, $http, socket, c3Factory) {
    $scope.awesomeThings = [];
    $scope.trends = [];
    var trendupdates = [];

    var maxUpdates = 10;
    var curUpdates = 0;

    //var addUpdatesList = function(trend) {
    //  trend.updates = [];
    //  for (var i=0; i < maxUpdates; i++) {
    //    trend.updates.push(0);
    //  }
    //}

    $scope.config = {
      data: {
        x: 'x',
        columns: []
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%H:%I:%S',
            fit: true
          }
        }
      },
      grid: {
        x: {
          show: true
        },
        y: {
          show: true
        }
      }
    };

    var trends = {x:[]};

    $http.get('/api/trends').success(function(trends) {
      $scope.trends = trends;
      socket.syncUpdates('trend', $scope.trends);
      socket.socket.on('trendupdate', function(updates) {
        var ts = null;
        var out = [];
        for (var hashtag in updates) {
          //var trend = _.find($scope.trends, {name: hashtag});
          //if (!trend.updates) {
          //  trend.updates = [updates[hashtag]];
          //} else {
          //  trend.updates.push(updates[hashtag]);
          //}
          ts = updates[hashtag].date;
          //var line = [hashtag, updates[hashtag].value];
          //out.push(line);
          if (!trendupdates[hashtag]) {
            trendupdates[hashtag] = [updates[hashtag].value];
          } else {
            trendupdates[hashtag].push(updates[hashtag].value);
          }
        }
        if (!trendupdates["x"]) {
          trendupdates["x"] = [Date.parse(ts)];
        } else {
          trendupdates['x'].push(Date.parse(ts));
        }
        console.log(trendupdates);
        //out.unshift(['x', Date.parse(ts)])

        c3Factory.get('chart').then(function(chart) {
          curUpdates += 1;
          var length = 0;
          if (curUpdates >= maxUpdates) {
            length = 1;
          }
          chart.load({
            columns: transformColumns()
            //length: length
          });
        });
      });
    });

    var transformColumns = function() {
      var out = [];
      for (var key in trendupdates) {
        out.push([key].concat(trendupdates[key]));
      }
      console.log(out);
      return out;
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('trend');
      curUpdates = 0;
    });
  });