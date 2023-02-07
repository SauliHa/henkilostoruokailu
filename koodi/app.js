var kirjanpito = angular.module("kirjanpito", ["ionic", "ngCordova"]);
var db = null;           
            

kirjanpito.controller("kirjanpitoctrl", function($scope, $cordovaSQLite, $ionicPlatform, $ionicPopup, $cordovaFile){
    //muuttujien asetus
    $scope.kirjauduttu = false;
    $scope.kayttajat = [];
    $scope.ruoat = [];
    $scope.data = {};
    $scope.kuukausiostot = 0;
    $scope.kuukausiostot_temp = 0;
    $scope.kaikkiostokset = [];
    $scope.kaikkien_ostoksien_summa = 0;
    //HUOM! tämä muuttuja säätää selectissä näkyvät vuodet. Tarvittaessa lisää vuosia tähän!
    $scope.vuodet = ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024",
        "2025", "2026", "2027", "2028", "2029", "2030"];
    var kayttajamaara = 0;
    $scope.kuukaudet = [
        {id: 1,
        kuukausi: "Tammikuu"},
        {id: 2,
        kuukausi: "Helmikuu"},
        {id: 3,
        kuukausi: "Maaliskuu"},
        {id: 4,
        kuukausi: "Huhtikuu"},
        {id: 5,
        kuukausi: "Toukokuu"},
        {id: 6,
        kuukausi: "Kesäkuu"},
        {id: 7,
        kuukausi: "Heinäkuu"},
        {id: 8,
        kuukausi: "Elokuu"},
        {id: 9,
        kuukausi: "Syyskuu"},
        {id: 10,
        kuukausi: "Lokakuu"},
        {id: 11,
        kuukausi: "Marraskuu"},
        {id: 12,
        kuukausi: "Joulukuu"},
        ];
    
    
    

  
    $ionicPlatform.ready(function() {
           
            db = window.sqlitePlugin.openDatabase({name: 'demo.db', location: 'default'});
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS kayttajat (id integer primary key, nimi text)");
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS ruoat (id integer primary key, ruoka text, hinta text)");
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS ostokset (ostosid integer primary key, asiakasid integer, ruokaid integer, pvm text)");
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS tunnukset (id integer primary key, tunnus text, salasana text)");
            
            //
            // DATAHAUT
            //
            $scope.hae = function(){
                $scope.kayttajat = [];
                $cordovaSQLite.execute(db, 'SELECT * FROM kayttajat', []).then(function (tulos) {
                    for (var i=0; i < tulos.rows.length; i++){
                        $scope.kayttajat.push({
                           id: tulos.rows.item(i).id,
                           nimi: tulos.rows.item(i).nimi       
                        });
                    } 
                },function(err){
                    console.error(err);
                }); 
               $cordovaSQLite.execute(db, 'SELECT * FROM tunnukset', []).then(function (tulos) {
                   if(tulos.rows.length == 0){
                       $cordovaSQLite.execute(db, "INSERT INTO tunnukset (tunnus, salasana) VALUES('admin', 'mannikko')");
                   }else{
                       console.log(tulos.rows.item(0).id);
                       console.log(tulos.rows.item(0).tunnus);
                   }
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
          $scope.haeOstokset = function(kayttaja, kuukausi, vuosi){ 
            //asetetaan kuukausiostokset tyhjäksi, eli nollataan kaikki muuttujat
            //tämä varmistaa että mitää vanhoja ostoksia ei jää näkyviin, kun napilla haetaan uudet ostokset
            $scope.ostokset = [];
            $scope.kuukausiostot_temp = 0;
            $scope.kuukausiostot = 0;
            
            if(!kayttaja || !kuukausi || !vuosi){ //varmistetaan, että käyttäjä on antanut kaikki tarvittavat arvot
                $scope.virhe();
                return;
            }
            //luodaan sql-haku ostokset-taulusta, liittäen sen käyttäjät ja ruoat -tauluihin
            //tämä haku hakee kaikki ne ostokset, joiden asiakasid täsmää valitun käyttäjän id:hen
            $cordovaSQLite.execute(db, 'SELECT * FROM ostokset \n\
                                              INNER JOIN kayttajat ON ostokset.asiakasid = kayttajat.id\n\
                                              INNER JOIN ruoat ON ostokset.ruokaid = ruoat.id\n\
                                              WHERE ostokset.asiakasid = '+kayttaja, []).then(function(tulos){             
                
                if(tulos.rows.length > 0){ //suoritetaan seuraava vain jos tuloksia löytyi                           
                    for (var i=0; i < tulos.rows.length; i++){ //käydään läpi kaikki käyttäjän ostokset
                      var pvm = tulos.rows.item(i).pvm; 
                      var pvm2 = pvm.split(".");  //nämä rivit pilkkovat tietokannassa olevan päivämäärän,
                      var ostokuukausi = pvm2[1]; //ja pistävät kuukauden ja vuoden erillisiin muuttujiin,
                      var ostovuosi = pvm2[2];    //jotta niitä voi verrata käyttäjän antamiin tietohin
                        if(kuukausi == ostokuukausi && vuosi == ostovuosi){ //rajataan vain kyseisen kuukauden tulokset
                            $scope.kuukausiostot_temp += Number(tulos.rows.item(i).hinta);
                            $scope.kuukausiostot = $scope.kuukausiostot_temp.toFixed(2);
                            $scope.ostokset.push({ //lisätään kuukauden ostoksen tiedot scope muuttujaan
                                id: tulos.rows.item(i).ostosid,
                                kayttaja: tulos.rows.item(i).nimi,
                                kayttajaid: tulos.rows.item(i).asiakasid,
                                ruoka: tulos.rows.item(i).ruoka,
                                ruokaid: tulos.rows.item(i).ruokaid,
                                hinta: tulos.rows.item(i).hinta,
                                pvm: tulos.rows.item(i).pvm,
                                });
                        }

                    }
                }  
            }, function(err){
                console.error(err);
            });
                
        };//haeostokset loppu
          
          $scope.haekayttajamaara = function(){
              $cordovaSQLite.execute(db, 'SELECT * FROM kayttajat', []).then(function(tulos){
                  
                  kayttajamaara = tulos.rows.length;
              },function(err){
                  console.log(err);
              });
          };
          
          $scope.haeKaikkiOstokset = function(kuukausi, vuosi){
            
            $scope.kaikkiostokset = [];
            $scope.kaikkien_ostoksien_summa = 0;
            var kayttajanostot = new Array();
            
            if(!kuukausi || !vuosi){
                console.log("null value given")
                $scope.virhe();
                return;
            }
            
            console.log("käyttäjämäärä: " +kayttajamaara);
            haut(0, kayttajamaara);
            function haut(y, kayttajamaara){  
                    
                    $cordovaSQLite.execute(db, 'SELECT * FROM kayttajat', []).then(function(tulos1){
                       if(tulos1.rows.length > 0){
                           
                               kayttajanostot[y] = 0;
                               console.log("loopin ulkona: "+kayttajanostot[y]);
                               
                                $cordovaSQLite.execute(db, 'SELECT * FROM ostokset \n\
                                                      INNER JOIN kayttajat ON ostokset.asiakasid = kayttajat.id\n\
                                                      INNER JOIN ruoat ON ostokset.ruokaid = ruoat.id\n\
                                                       WHERE ostokset.asiakasid = '+tulos1.rows.item(y).id, []).then(function(tulos2){
                                    if(tulos2.rows.length > 0){
                                        console.log("tänne mentiin");
                                        for (var i=0; i < tulos2.rows.length; i++){
                                            var pvm = tulos2.rows.item(i).pvm;
                                            var pvm2 = pvm.split(".");
                                            var ostokuukausi = pvm2[1];
                                            var ostovuosi = pvm2[2];
                                            if(kuukausi == ostokuukausi && vuosi == ostovuosi){
                                                kayttajanostot[y] = kayttajanostot[y] + Number(tulos2.rows.item(i).hinta);
                                                console.log("loopin sisällä: "+kayttajanostot[y]);
                                            }

                                        }
                                        console.log("Id: "+tulos1.rows.item(y).id);
                                        console.log("Nimi: "+tulos1.rows.item(y).nimi);
                                        console.log("Käyttäjän ostot" +kayttajanostot);
                                        var kayttajanostot_muokattu;
                                        kayttajanostot_muokattu = kayttajanostot[y].toFixed(2);
                                        $scope.kaikkien_ostoksien_summa += Number(kayttajanostot_muokattu);
                                        $scope.kaikkiostokset.push({

                                            id: tulos1.rows.item(y).id,
                                            kayttajanimi: tulos1.rows.item(y).nimi,
                                            ostosumma: kayttajanostot_muokattu                                 
                                        });
                                        y++;
                                        if(y<kayttajamaara){
                                            haut(y,kayttajamaara);
                                        }else{
                                            console.log("kierrrokset täynnä");
                                            $scope.kaikkien_ostoksien_summa = $scope.kaikkien_ostoksien_summa.toFixed(2);
                                        }
                                        
                                    }else{
                                        console.log("käyttäjällä ei ole ostoksia");
                                        y++;
                                        if(y<kayttajamaara){
                                            haut(y,kayttajamaara);
                                        }else{
                                            console.log("kierrokset täynnä")
                                        }
                                    }  
                                }, function(err){
                                    console.error(err);
                                });
                                
                        
                    }else{
                        console.log("tälle kuukaudelle ei löytynyt ostoksia");
                    }
                });
            }//haut funktio
            
                
          };//haeostokset
          
       $scope.haeTunnus = function(tunnus, salasana){
           
           $cordovaSQLite.execute(db, 'SELECT * FROM tunnukset WHERE tunnus = ? AND salasana = ?', [tunnus, salasana]).then(function (tulos) {
               if(tulos.rows.length > 0){
                       console.log("kirjauduttu sisään");
                       $scope.kirjauduttu = true;
                   }else{
                       $scope.kirjautumisvirhe();
                   }
            },function(err){
                    console.error(err);
             });
       };
          
     //virhemessage
     $scope.virhe = function(){
      var virhe = $ionicPopup.show({
         title: 'Virhe!',
         subTitle: 'Et antanut kaikkia tietoja tai antamasi tiedot olivat virheellisiä.',
         scope: $scope,
			
         buttons: [
            {
               text: 'Ok',
               type: 'button-light',
                  
            }
         ]
      });
     };
     
     $scope.kirjautumisvirhe = function(){
        var virhe = $ionicPopup.show({
         title: 'Virhe!',
         subTitle: 'Väärä käyttäjätunnus tai salasana!',
         scope: $scope,
			
         buttons: [
            {
               text: 'OK',
               type: 'button-light',
                  
            }
         ]
      }); 
     };
     
     $scope.yhteenvetoilmoitus = function(){
        var ilmoitus = $ionicPopup.show({
         title: 'Yhteenveto luotu!',
         subTitle: 'Löydät yhteenvetotiedoston laitteen muistin juuresta.',
         scope: $scope,
			
         buttons: [
            {
               text: 'OK',
               type: 'button-light',
                  
            }
         ]
      }); 
     };
     
     $scope.vaihdaSalasana = function(sal1, sal2){
         if(sal1 == sal2){
             var query = "UPDATE tunnukset SET salasana = ? WHERE id = 1";
                         $cordovaSQLite.execute(db, query, [sal1]).then(function() {
                                console.log("salasanaksi vaihdettu "+sal1);
                                var ilmoitus = $ionicPopup.show({
                                    title: 'Salasana vaihdettu!',
                                    subTitle: 'Uusi ylläpitotunnuksen salasana on: ' +sal1,
                                    scope: $scope,
                                    buttons: [
                                       {
                                          text: 'OK',
                                          type: 'button-light',

                                       }
                                    ]
                                });
                            }, function (err) {
                               console.error(err);
                         });
         }else{
             var virhe = $ionicPopup.show({
                title: 'Virhe!',
                subTitle: 'Salasanat eivät täsmää!',
                scope: $scope,

                buttons: [
                   {
                      text: 'Ok',
                      type: 'button-light',

                   }
                ]
            }); 
         }
     };
     
          
        
    $scope.hae();
    $scope.haeRuoat();
    $scope.haekayttajamaara();
        
        
     $scope.lisaaKayttaja = function(nimi) {
         if(!nimi){
             $scope.virhe();
             return;
         }
         var query = "INSERT INTO kayttajat (nimi) VALUES (?)";
         $cordovaSQLite.execute(db, query, [nimi]).then(function(res) {
            console.log("INSERT ID -> " + res.insertId);
            $scope.hae();
            $scope.haekayttajamaara();
        }, function (err) {
            console.error(err);
        });
         
        
    };
    
    $scope.lisaaRuoka = function(ruoka, hinta) {
         var hinta2 = hinta.replace(",",".");
         if(!ruoka || !hinta2 || isNaN(hinta2)){
             $scope.virhe();
             return;
         }
        var query = "INSERT INTO ruoat (ruoka, hinta) VALUES (?, ?)";
         $cordovaSQLite.execute(db, query, [ruoka, hinta2]).then(function(res) {
            console.log("INSERT ID -> " + res.insertId);
            $scope.haeRuoat();
         }, function (err) {
            console.error(err);
        });
    };
    
    $scope.poista = function(id){
        var query = "DELETE FROM ostokset WHERE asiakasid = ?";
         $cordovaSQLite.execute(db, query, [id]).then(function(res) {
            console.log("Poistetun ostoksen ID -> " +id);
         }, function (err) {
            console.error(err);
        });
        var query = "DELETE FROM kayttajat WHERE id = ?";
        $cordovaSQLite.execute(db, query, [id]).then(function(res) {
            console.log("Poistetun käyttäjän ID -> " +id);
            $scope.hae();
         }, function (err) {
            console.error(err);
        });
    };
    $scope.poistaRuoka = function(id){
        var query = "DELETE FROM ostokset WHERE ruokaid = ?";
         $cordovaSQLite.execute(db, query, [id]).then(function(res) {
            console.log("Poistetun ostoksen ID -> " +id);
         }, function (err) {
            console.error(err);
        });
        var query = "DELETE FROM ruoat WHERE id = ?";
        $cordovaSQLite.execute(db, query, [id]).then(function(res) {
            console.log("Poistetun tuotteen ID -> " +id);
            $scope.haeRuoat();
        }, function (err) {
            console.error(err);
        });
        
    };
    $scope.poistaOstos = function(id){
        var query = "DELETE FROM ostokset WHERE ostosid = ?";
        $cordovaSQLite.execute(db, query, [id]).then(function(res) {
            console.log("Poistetun ostoksen ID -> " +id);
         }, function (err) {
            console.error(err);
        });
    };
    $scope.poistoVarmistus = function(id, poistotyyppi){
        var poistovarmistus = $ionicPopup.show({
            template: '<strong>Haluatko varmasti poistaa tämän kentän? Id: '+id+'</strong>',
            title: 'Poistovarmistus',
            scope: $scope,
            buttons:[
                {
                    text: 'Peruuta',
                },{ 
                    text: 'OK',
                    type: 'button-danger',
                    onTap: function(e){
                        if(poistotyyppi == 1){
                            $scope.poista(id);
                        }else if(poistotyyppi == 2){
                            $scope.poistaRuoka(id);
                        }else if(poistotyyppi == 3){
                            $scope.poistaOstos(id);
                        }
                    }
                }   
            ]
            
        });
    };
    
    
    $scope.muokkaaHintaa = function(id, hinta, nimi){
        $scope.data = {};
        var muokkausIkkuna = $ionicPopup.show({
         template: ' Aseta uusi hinta: <input type="text" ng-model="data.uusihinta" value="'+hinta+'">',
         title: 'Hinnan muutos tuoteelle ' +nimi,
         scope: $scope,		
         buttons: [
            { text: 'Peruuta' },{
               text: '<b>Tallenna</b>',
               type: 'button-positive',
                  onTap: function(e) {
                     
                     if ($scope.data.uusihinta ) {
                        var hinta2 = $scope.data.uusihinta.replace(",",".");
                        if(isNaN(hinta2)){
                            $scope.virhe();
                            e.preventDefault();
                        }else {
                         var query = "UPDATE ruoat SET hinta ="+hinta2+" WHERE id = "+id;
                         $cordovaSQLite.execute(db, query).then(function() {
                                
                                console.log(id);
                               $scope.haeRuoat();
                            }, function (err) {
                               console.error(err);
                         });
                        }//inner if/else
                       
                     }//if 
                  }//ontap
            }//button
         ]
      });//window
    };//function
    
  
    
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
                        $scope.virhe();
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
             <strong>Oletko varma?</strong>',
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
                         }, function (err) {
                            console.error(err);
                        });
                    }
                }   
            ]
        });
    };//varmistus
    
    $scope.kirjoita = function(nimi, kuukausi, vuosi){
        var tiedostoteksti = "";
        if(!nimi || !kuukausi || !vuosi){
           $scope.virhe(); 
           return;
        }
        for( i = 0; i < $scope.ostokset.length; i++){
           tiedostoteksti += "<tr><td>" + $scope.ostokset[i].ruoka + "</td><td>"+$scope.ostokset[i].hinta+"€</td><td>"+ $scope.ostokset[i].pvm+"</td></tr>";
        }
        
                    
        
        $cordovaFile.writeFile(
                cordova.file.externalRootDirectory,
                nimi+' - '+kuukausi +' '+ vuosi +'.html',
                '<meta charset="UTF-8">\
                <h1>Käyttäjän '+nimi + ' ostokset ' +kuukausi+ 'ssa '+vuosi+'</h1>\n\
                <strong>Kokonaissumma: </strong>'+$scope.kuukausiostot+'€<br/>\n\
                <table border="1">\n\
                <tr><th>Ostos</th><th>Hinta</th><th>Päivämäärä</th></tr>\n\
                '+tiedostoteksti+'</table>',
                true
            ).then(function(result) {
                console.log("kirjoitettu");
                $scope.yhteenvetoilmoitus();
        },function (err) {
            $scope.tietovirhe(err);
            }
        );
        };
    
    $scope.luoYhteenveto = function(kuukausi, vuosi){ //tämä suoritetaan yhteenvetopainikeella
        var tiedostoteksti = ""; //luodaan tyhjä tekstimuuttuja ostoksien näyttämistä varten
        var ostot_temp = 0;
        var loppusumma = $scope.kaikkien_ostoksien_summa.replace(".", ",");
        if(!kuukausi || !vuosi){//jos tietoja ei annettu näytetään virheilmoitus
           $scope.virhe(); 
           return;
        }
        for( i = 0; i < $scope.kaikkiostokset.length; i++){ //tehdään jokaisesta ostoksesta taulukon rivi
            ostot_temp = $scope.kaikkiostokset[i].ostosumma.replace(".", ",");
            tiedostoteksti += '<tr><td>'+ $scope.kaikkiostokset[i].kayttajanimi + 
                              '</td><td>' + ostot_temp + '</td></tr>';
            
           console.log("luoyhteenveto loop: "+i);           
        }
        $cordovaFile.writeFile( //file pluginin kirjoituskomento, jolla tiedosto luodaan
                cordova.file.externalRootDirectory, //asetetaan tallennuspaikaksi muistikortin juurihakemisto
                'Kuukausiyhteenveto - '+kuukausi +' '+ vuosi +'.html',
                '<meta charset="UTF-8">\n\
                <h1>Käyttäjien ostot '+kuukausi+'ssa '+vuosi+'</h1>\n\
                <strong>Kokonaissumma: </strong>'+loppusumma+'€<br/>\n\
                <table border="1">\n\
                <tr><th>Käyttäjä</th><th>Ostokset</th></tr>' + tiedostoteksti+'\n\
                </table>',
                true
            ).then(function(result) {
                $scope.yhteenvetoilmoitus(); //ajetaan funktio joka näyttää yhteenvetoilmoituksen 
        },function (err) {
            $scope.tietovirhe(err);
            }
        );
    };
    
    $scope.piilotaOstot = function(){
        $scope.ostokset = [];
        $scope.kuukausiostot = 0;
        $scope.kuukausiostot_temp = 0;
    };
    
    $scope.tietovirhe = function(error){
        var ilmoitus = $ionicPopup.show({
         title: 'Virhe!',
         subTitle: 'Viesti:' +error,
         scope: $scope,
			
         buttons: [
            {
               text: 'OK',
               type: 'button-light',
                  
            }
         ]
      }); 
    };
    
    
    }); //ionicplatform ready

}); //controller




