var kirjanpito = angular.module("kirjanpito", ["ionic", "ngCordova"]);
var db = null;           
            

kirjanpito.controller("kirjanpitoctrl", function($scope, $cordovaSQLite, $ionicPlatform, $ionicPopup){
    $scope.kayttajat = [];
    $scope.ruoat = [];
    $scope.data = {};

  
    $ionicPlatform.ready(function() {
           
            db = window.sqlitePlugin.openDatabase({name: 'demo.db', location: 'default'});
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS kayttajat (id integer primary key, nimi text)");
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS ruoat (id integer primary key, ruoka text, hinta text)");
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS ostokset (id integer primary key, asiakasid integer, ruokaid integer, pvm text)");
            
            //
            // DATAHAUT
            //
            $scope.hae = function(){
                $scope.kayttajat = [];
                $cordovaSQLite.execute(db, 'SELECT * FROM kayttajat', []).then(function (tulos) {
                    if(tulos.rows.length == 0){
                        $cordovaSQLite.execute(db, "INSERT INTO kayttajat (nimi) VALUES('Matti Meikäläinen')");
                    }else{
                        for (var i=0; i < tulos.rows.length; i++){
                            $scope.kayttajat.push({
                                id: tulos.rows.item(i).id,
                                nimi: tulos.rows.item(i).nimi       
                            });
                        }
                    } 
                },function(err){
                    console.error(err);
                });      
           };
           $scope.haeRuoat = function(){
               $scope.ruoat = [];
               $cordovaSQLite.execute(db, 'SELECT * FROM ruoat', []).then(function(tulos){
                    for (var i=0; i < tulos.rows.length; i++){
                            if(tulos.rows.length > 0){
                                $scope.ruoat.push({
                                    id: tulos.rows.item(i).id,
                                    ruoka: tulos.rows.item(i).ruoka,
                                    hinta: tulos.rows.item(i).hinta
                                });
                            }
                            
                        }
                }, function(err){
                    console.error(err);
                });
          };
          $scope.haeOstokset = function(){
              $scope.ostokset = [];
               $cordovaSQLite.execute(db, 'SELECT * FROM ostokset \n\
                                          INNER JOIN kayttajat ON ostokset.asiakasid = kayttajat.id\n\
                                          INNER JOIN ruoat ON ostokset.ruokaid = ruoat.id', []).then(function(tulos){
                    for (var i=0; i < tulos.rows.length; i++){
                            if(tulos.rows.length > 0){
                                $scope.ostokset.push({
                                    id: tulos.rows.item(i).id,
                                    kayttaja: tulos.rows.item(i).nimi,
                                    kayttajaid: tulos.rows.item(i).asiakasid,
                                    ruoka: tulos.rows.item(i).ruoka,
                                    ruokaid: tulos.rows.item(i).ruokaid,
                                    hinta: tulos.rows.item(i).hinta,
                                    pvm: tulos.rows.item(i).pvm,
                                });
                            }
                            
                        }
                }, function(err){
                    console.error(err);
                });
          };
           
        $scope.hae();
        $scope.haeRuoat();
        $scope.haeOstokset();
        
     $scope.lisaaKayttaja = function(nimi) {
         if(nimi.length > 0){
             var query = "INSERT INTO kayttajat (nimi) VALUES (?)";
            $cordovaSQLite.execute(db, query, [nimi]).then(function(res) {
               console.log("INSERT ID -> " + res.insertId);
               $scope.hae();
            }, function (err) {
               console.error(err);
           });
         }
        
    };
    
         $scope.lisaaRuoka = function(ruoka, hinta) {
        var query = "INSERT INTO ruoat (ruoka, hinta) VALUES (?, ?)";
        
         $cordovaSQLite.execute(db, query, [ruoka, hinta]).then(function(res) {
            console.log("INSERT ID -> " + res.insertId);
            $scope.haeRuoat();
         }, function (err) {
            console.error(err);
        });
    };
    
    $scope.poista = function(id){
        var query = "DELETE FROM kayttajat WHERE id = ?";
        $cordovaSQLite.execute(db, query, [id]).then(function(res) {
            console.log("Poistetun käyttäjän ID -> " +id);
            $scope.hae();
         }, function (err) {
            console.error(err);
        });
    };
    
    $scope.poistaRuoka = function(id){
        var query = "DELETE FROM ruoat WHERE id = ?";
        $cordovaSQLite.execute(db, query, [id]).then(function(res) {
            console.log("Poistetun tuotteen ID -> " +id);
            $scope.haeRuoat();
         }, function (err) {
            console.error(err);
        });
    };
    
  
    
    $scope.avaaOstosIkkuna = function(id, nimi){
        $scope.data = {};
    
      // Custom popup
      var myPopup = $ionicPopup.show({
         template: 'Valitse ruokalaji: \n\
                    <select ng-model="data.lounasvalinta" ng-options="ruoka as ruoka.ruoka+ \' - Hinta: \' + ruoka.hinta + \'€ \' for ruoka in ruoat">\n\
                    </select>',
         title: 'Lounasvalikko',
         subTitle: 'Käyttäjän ' +nimi+ ' ostosikkuna',
         scope: $scope,		
         buttons: [
            { text: 'Peruuta' },{
               text: '<b>Tallenna</b>',
               type: 'button-positive',
                  onTap: function(e) {
						
                     if (!$scope.data.lounasvalinta) {
                        //don't allow the user to close unless he enters model...
                        console.log("igiu");
                        console.log("Luonasvalinta: " +$scope.data.lounasvalinta.id);
                           e.preventDefault();
                     } else {
                         console.log("Luonasvalinta: " + $scope.data.lounasvalinta.id);
                         $scope.varmistus(id, $scope.data.lounasvalinta.id, $scope.data.lounasvalinta.ruoka, $scope.data.lounasvalinta.hinta);
                            
                     }
                  }
            }
         ]
      });
      myPopup.then(function(res) {
         console.log('Tapped!', res);
      });    
    }; //avaaostosikkuna
    $scope.varmistus = function(asiakasid, id, nimi, hinta){
        var varmistusIkkuna = $ionicPopup.show({
            template: 'Olet ostamassa ruoan: '+nimi+ '<br/> Hintaan '+ hinta +'€ <br/> <br/>\n\
             <strong>Oletko varma</strong>',
            title: 'Ostosvarmistus',
            scope: $scope,
            buttons:[
                {
                    text: 'Peruuta'
                },{ 
                    text: 'OK',
                    type: 'button-positive',
                    onTap: function(e){
                        var datenow = new Date(); 
                        var paiva = datenow.getDate();
                        var kuukausi = datenow.getMonth() +1;
                        var vuosi = datenow.getFullYear();
                        var pvm = paiva + "." + kuukausi + "."+ vuosi;
                        var query = " INSERT INTO ostokset (asiakasid, ruokaid, pvm) values (?,?,?)";
                        $cordovaSQLite.execute(db, query, [asiakasid, id, pvm]).then(function(res) {
                            console.log("Lisätyn ostoksen id -> " +id);
                            $scope.hae();
                            $scope.haeOstokset();
                         }, function (err) {
                            console.error(err);
                        });
                    }
                }   
            ]
        });
    };//varmistus

    
    
    }); //ionicplatform ready

}); //controller




