/**
 * Created by Thomas on 17.04.14.
 */
App = Ember.Application.create({});

App.Router.map(function () {
  this.resource('sign');
  this.resource('revoke');
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    // this redirects / to /sign
    this.transitionTo('sign');
  }
});


App.SignRoute = Ember.Route.extend({
  model: function () {
    return Ember.$.getJSON('listUnsigned');
  }
});

App.SignController = Ember.ArrayController.extend({
  actions: {
    signAction: function(id) {
      console.log("sign is called");
      console.log("the id is: " + JSON.stringify(id));
      var that = this;

      $.post("sign", { "id": id }, function(data) {
        console.log(data);
        console.log(data.successful);
        if (data.successful === true) {
          var item = that.find(function(item, index, enumerable) {
            if (item._id === id) {
              return true;
            } else {
              return false;
            }
          });
          that.removeObject(item);
          alertify.success("Signing successful");
        } else {
          console.log("signing was not successful");
          alertify.error("Signing failed");
        }
      }, "json");
    }
  }
});

App.RevokeRoute = Ember.Route.extend({
  model: function () {
    return Ember.$.getJSON('listSigned');
  }
});

App.RevokeController = Ember.ArrayController.extend({
  actions: {
    revokeAction: function(id) {
      console.log("revoke is called");
      console.log("the id is: " + JSON.stringify(id));
      var that = this;

      $.post("revoke", { "id": id }, function(data) {
        console.log(data);
        console.log(data.successful);
        if (data.successful === true) {
          var item = that.find(function(item, index, enumerable) {
            if (item._id === id) {
              return true;
            } else {
              return false;
            }
          });
          that.removeObject(item);
          alertify.success("Revokation successful");
        } else {
          console.log("signing was not successful");
          alertify.error("Revokation failed");
        }
      }, "json");
    }
  }
});

Ember.Handlebars.helper('format-date', function (date) {
  return moment(date).fromNow();
});

Ember.Handlebars.helper('format-date-pretty', function (date) {
  return moment(date).format('LLL');
});

$(function() {
  $('body').tooltip({
    selector: '[rel=tooltip]'
  });
});