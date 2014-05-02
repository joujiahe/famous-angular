// 
// © 2014 Thomas Street LLC. All rights reserved
//

angular.module('famous.angular')
  .directive('faSurface', function (famous, $interpolate, $controller, $compile) {
    return {
      scope: true,
      transclude: true,
      template: '<div class="fa-surface"></div>',
      restrict: 'EA',
      compile: function(tElem, tAttrs, transclude){
        return {
          pre: function(scope, element, attrs){
            scope.isolate = scope.isolate || {};
            scope.isolate[scope.$id] = scope.isolate[scope.$id] || {};
            var isolate = scope.isolate[scope.$id];

            var Surface = famous['famous/core/Surface'];
            var Transform = famous['famous/core/Transform']
            var EventHandler = famous['famous/core/EventHandler'];
            
            //update properties
            //TODO:  is this going to be a bottleneck?
            scope.$watch(
              function(){
                return isolate.getProperties()
              },
              function(){
                if(isolate.surface)
                  isolate.surface.setProperties(isolate.getProperties());
              },
              true
            )

            isolate.getProperties = function(){
              return {
                backgroundColor: scope.$eval(attrs.faBackgroundColor),
                color: scope.$eval(attrs.faColor)
              };
            };

            var getOrValue = function(x) {
              return x.get ? x.get() : x;
            };

            //TODO: $observe attributes and pass updated values
            // into variables that are returned by functions that
            // can then be passed into modifiers

            var modifiers = {
              origin: scope.$eval(attrs.faOrigin),
              translate: scope.$eval(attrs.faTranslate),
              rotateZ: scope.$eval(attrs.faRotateZ),
              skew: scope.$eval(attrs.faSkew)
            };

            isolate.surface = new Surface({
              size: scope.$eval(attrs.faSize),
              class: scope.$eval(attrs.class),
              properties: isolate.getProperties()
            });

            //TODO:  support ng-class
            if(attrs.class)
              isolate.surface.setClasses(attrs['class'].split(' '));

            isolate.modifier = function() {
              return modifiers;
            };

            if (attrs.faPipeTo) {
              isolate.surface.pipe(scope.$eval(attrs.faPipeTo));
            }

            if (attrs.faClick) {
              isolate.surface.on("click", function() {
                scope.$eval(attrs.faClick);
              });
            }

          },
          post: function(scope, element, attrs){
            var isolate = scope.isolate[scope.$id];
            var updateContent = function(){
              var compiledEl = isolate.compiledEl = isolate.compiledEl || $compile(element.find('div.fa-surface').contents())(scope)
              isolate.surface.setContent(isolate.compiledEl.context);
            };

            updateContent();

            //boilerplate
            transclude(scope, function(clone) {
              element.find('div.fa-surface').append(clone);
            });

            //TODO:  support data-bound ids (supports only strings for now)
            //Possibly make "fa-id" for databound ids?
            //Register this modifier by ID in bag
            var id = attrs.id;
            famous.bag.register(id, isolate.surface)

            scope.$emit('registerChild', {view: isolate.surface, mod: isolate.modifier});
          }
        }
      }
    };
  });
