/**
 * Created by Thomas on 01.04.14.
 */
App = Ember.Application.create({});

App.Router.map(function () {
    this.resource('home');
    this.resource('encode');
    this.resource('verify');
    this.resource('list');
    this.resource('developer');
    this.resource('about');
    this.resource('app');
    this.resource('search');
});

App.Signature = Ember.Object.extend({
    urlInput: "",
    successful: false,
    imagePath: "",
    downloadPath: "",
    type: null,
    shorten: null,
    printedUrl: ""
});

App.Verification = Ember.Object.extend({
    successful: false,
    date: null,
    url: "",
    hash: "",
    imagePath: "",
    downloadPath: "",
    checked: false
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    // this redirects / to /home
    this.transitionTo('home');
  }
});

App.EncodeRoute = Ember.Route.extend({
    model: function() {
        return App.Signature.create();
    }
});

App.VerifyRoute = Ember.Route.extend({
    model: function() {
        return App.Verification.create();
    }
});

App.ListRoute = Ember.Route.extend({
    model: function () {
        return Ember.$.getJSON('list');
    }
});

App.SearchController = Ember.ArrayController.extend({
  search: "",
  signatures: [],
  onChangeSearch: function() {
    console.log("onChangeSearch is called");
    var query = this.get("search");
    var that = this;
    console.log("the query is: " + query);
    Ember.$.getJSON('search', {"url": query}, function(data) {
      if(data.length > 0) {
        that.set("signatures", data);
      } else {
        that.set("signatures", null);
      }
    });
  }.observes("search")
});

App.VerifyController = Ember.ObjectController.extend({
   actions: {
       verifyAction: function() {
           console.log("verify is called");

           var verification = this.get("model");
         this.set("chash", verification.hash);
         this.set("curl", verification.url);

         $.post("verify", { "url": verification.url, "hash": verification.hash}, function (data) {
           console.log("the post response is: " + JSON.stringify(data));
           verification.set("successful", data.successful);
           verification.set("checked", true);
               verification.set("date", data.date);
               verification.set("imagePath", "qr/" + "svg/" + data.id);
               verification.set("downloadPath", "qr/" + "svg/" + data.id + "?dl");
         });
       }
   },
  chash: null,
  curl: null
});

App.EncodeController = Ember.ObjectController.extend({
    actions: {
        submitAction: function() {
            console.log("now we can submit the model:" + this.get("model"));
            console.log("sending url to server");
            console.log("the url is: " + this.get("model").urlInput);
            console.log("the image type is: " + this.get("selectedType"));

            this.set("shorten", $("[name='shorten']").is(":checked"));
            console.log("the value of the shorten checkbox is: " + this.get("shorten"));

            var signature = this.get("model");
            signature.set("successful", false);
            signature.set("imagePath", "");
            signature.set("type", this.get("selectedType"));
            signature.set("shorten", this.get("shorten"));
            signature.set("printedUrl", signature.urlInput);

          $.post("encode", { "urlInput": signature.urlInput, "shorten": signature.shorten }, function(data) {
                signature.set("successful", data.successful);
                signature.set("imagePath", "qr/" + signature.type + "/" + data.id);
                signature.set("downloadPath", "qr/" + signature.type + "/" + data.id + "?dl");
            }, "json")
        }
    },
    imageTypes: ["svg", "png", "eps", "pdf"],
    selectedType: "svg",
    shorten: true
});


App.PictureView = Ember.View.extend({
    successful: Ember.Binding.oneWay('App.Signature.successful'),
    imagePath: Ember.Binding.oneWay('App.Signature.imagePath'),
    url: Ember.Binding.oneWay('App.Signature.urlInput'),
    type: Ember.Binding.oneWay('App.Signature.imageType')
});

App.VerifyView = Ember.View.extend({
    successful: Ember.Binding.oneWay('App.Verification.successful'),
    date: Ember.Binding.oneWay('App.Verification.date'),
    url: Ember.Binding.oneWay('App.Verification.url'),
    hash: Ember.Binding.oneWay('App.Verification.hash')
});

App.EncodeView = Ember.View.extend({
  didInsertElement: function() {
    // needed to keep the bootstrap switch after switching tabs
    $("[name='shorten']").bootstrapSwitch();
  }
});

Ember.Handlebars.helper('format-date', function (date) {
    return moment(date).fromNow();
});

Ember.Handlebars.helper('format-date-pretty', function (date) {
    return moment(date).format('LLL');
});

App.Checkbox = Ember.Checkbox.reopen({
  attributeBindings: ['data-toggle', 'checked']
});

$(function() {
  $('body').tooltip({
    selector: '[rel=tooltip]'
  });
});