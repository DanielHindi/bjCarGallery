/**
 * Created by danielhindi on 3/29/17.
 */

var app = angular.module('carGalleryApp',['infinite-scroll']);


app.controller('galleryCtrl',['$scope',function($scope){
    $scope.items = [];

    var itemIndex=0;
    $scope.nextPage= function() {
        for (var i = 0; i < 10; i++) {
            itemIndex++;
            if(itemIndex > auction.items.length-1)break;

            var itm = auction.items[itemIndex ];
            itm.src= buildfire.imageLib.cropImage(itm.images[0].fullsize_url, {
                width: 'full',
                height: Math.round(window.innerHeight / 2)
            });
            $scope.items.push(itm);
        }
    };
    $scope.nextPage();

    var galleryOptions= {
        bgOpacity: .9,
        showHideOpacity:true,
        closeOnScroll:false
    };

    $scope.openItem = function(itm){
        var items=[];
        itm.images.forEach(function(img){
            if(itm.images && itm.images.length) {
                items.push({
                    src: buildfire.imageLib.cropImage(img.fullsize_url, {
                        width: 'full',
                        height: Math.round(window.innerHeight / 2)
                    }),
                    w: 600,
                    h: 400
                });
            }

        });

        items[0].title= '<h3>' + itm.marketing_desc + '</h3>'
            + '<br/>' + itm.short_desc;



        items.push({
            title:'<div class="caption">'
                + itm.long_desc
                + '<br/>'
                + '<br/>' + itm.exterior_color + ' / ' + itm.interior_color
                + '<br/>' + (itm.cylinders?itm.cylinders:'?') + ' Cylinders ' + (itm.transmission?itm.transmission:'?') + ' Transmission '
                + '<br/>' + (itm.price?'$' + itm.price:'') +  itm.salestatus
                + '<br/>Lot ' + (itm.lotnumber || '')
                //+ '<br/>Reserve: ' + itm.reserve_type || ''
                + '<br/>Vin #' + (itm.vin || '')
            + '</div>'
            ,w:100
            ,height:0
    });

        openGallery(items,galleryOptions);


    }
}]);