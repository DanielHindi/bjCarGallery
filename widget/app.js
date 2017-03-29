/**
 * Created by danielhindi on 3/29/17.
 */

var app = angular.module('carGalleryApp',['infinite-scroll']);

app.controller('galleryCtrl',['$scope','cropOptions','bjData','popupGallery',function($scope,cropOptions,bjData,popupGallery){

    $scope.items = [];
    /// lazy load auction items in
    $scope.nextPage= function() {
        bjData.getNextPage(function(err,items){
            if(err){
                console.error(error);
                return;
            }
            items.forEach(function(itm){
                if(itm.images && itm.images.length && itm.images[0].fullsize_url) {
                    itm.src = buildfire.imageLib.cropImage(itm.images[0].fullsize_url, cropOptions);
                    $scope.items.push(itm);
                }
            })
        });
    };

    /// get first page right off the bat
    $scope.nextPage();

    var galleryOptions= {
        bgOpacity: .9,
        showHideOpacity:true,
        closeOnScroll:false,
        history:false
    };

    /// it an auction item is clicked go call popup gallery
    $scope.openItem = function(itm){
        var items=[];
        itm.images.forEach(function(img){
            if(itm.images && itm.images.length) {
                if(img.fullsize_url) {
                    items.push({
                        src: buildfire.imageLib.cropImage(img.fullsize_url, cropOptions),
                        w: cropOptions.width,
                        h: cropOptions.height
                    });
                }
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

        popupGallery.open(items,galleryOptions);


    }
}]);

app.service('cropOptions', [function(){
    /// try to handle both landscape and portrait

    var cropOptions={ // landscape
        width: Math.round(window.innerWidth * 0.66),
        height: Math.round(window.innerHeight * 0.66)
    };

    if(window.innerHeight >window.innerWidth )
        cropOptions={ // portrait
            width: window.innerWidth ,
            height: Math.round(window.innerWidth * (9/16))
        };

    return cropOptions;
}]);

app.service('bjData',['$http',function($http){
    var auction = window.auction ;

    /// load auction data from REST api
    function loadAuction(id){
        var url = 'http://barrettjacksonservices.azurewebsites.net/api/auction/' + id;
        $http.get(url).then(function (data) {
            debugger;
            auction = data;
        }, function (err) {
            debugger;
        });
    }

    /// check if we have a loaded version from cache
    if(!auction) {
        ///if not get the auction id from datastore and pull latest data
        buildfire.datastore.get(function (err, obj) {
            if (err) {
                console.error(err);
                return;
            }

            if (!obj.data || !obj.data.auctionId) return;

            loadAuction(obj.data.auctionId);

        });
    }

    /// if you're in teh CP and they just updated the Auction ID then reload
    buildfire.datastore.onUpdate(function(obj){
        debugger;
        loadAuction(obj.data.auctionId);
    });

    /// return singleton service that allows them to lazy load the data in
    return {
        pageSize:50
        ,currentIndex:0
        ,getNextPage: function(callback){ /// fake pagination until you have it
            var items=[];
            if(!auction){
                callback(new Error('no action data'));
                return;
            }
            for (var i = 0; i < this.pageSize; i++) {
                this.currentIndex++;
                if(this.currentIndex > auction.items.length-1)break;
                items.push(auction.items[this.currentIndex]);
            }
            callback(null,items)
        }
    };

} ] );

app.service('popupGallery', [function(){
    /// this code is for the pop up gallery swipe
    var pswpElement = document.querySelector('.pswp');

     return{
         open:function(items,options) {
             // define options (if needed)
             if(!options ) options = {index:  0 };

             // Initializes and opens PhotoSwipe
             var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
             gallery.init();
         }
     };
}]);