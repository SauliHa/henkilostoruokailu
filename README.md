## Kuvaus

Tämä kansio sisältää 2017 luomani mobiilisovelluksen, jolla pidetään kirjaa käyttäjien ruokailu-kuluista. Tehtävänantona oli luoda yksinkertainen, Internet-riippumaton sovellus käyttäjien ruokaostosten kirjanpitoa varten.
Sovelluksen tarkoitus oli korvata kynällä ja paperilla suoritettava kirjanpito.

Sovellus toteutettiin yhden sivun applikaationa Javascriptiä sekä angularJS, Cordova ja ionic työkaluja käyttäen.
Tietojen varastointiin käytettiin SQLite menetelmää, joka tallentaa tiedot mobiililaitteen muistiin.
Tässä toteutuksessa ei juurikaan panostettu sovelluksen tietoturvaan, sillä sovellus ei siirrä mitään tietoja verkon yli ja tehtävänannossa oli määritelty että sovellukseen ei tarvitse tehdä muuta kuin yksinkertaisen kirjautumisen ylläpitäjälle. 
Peruskäyttäjille ei toteutettu käyttäjätunnuksia.

## Kansion sisältö

Kansio sisältää .apk tiedoston sovelluksen tarkastamiseen Android-laitteilla. Koodikansio sisältää HTML ja Javascript tiedostot projektin lähdekoodista.
Koko projektia ei tämä Github kansio sisällä.

## Sovelluksen käyttö

Sovellus on yhden sivun applikaatio, joka sisältää kaksi puolta: käyttäjä ja ylläpitäjä.

### Ylläpitäjä

Ylläpitäjän toiminnot on rajattu hyvin yksinkertaisen kirjautumismenetelmän taakse. 
Oletuksena tunnus on "admin" ja salasana "mannikko".
Ylläpitäjä pystyy lisäämään käyttäjiä järjestelmään kirjoittamalla käyttäjän nimen, sekä tarkastamaan listaa nykyisistä käyttäjistä ja poistamaan niitä.
Ylläpitäjä voi myös lisätä ja poistaa ruokavalikoiman tuotteita sekä muokata niiden hintoja.
Ylläpito-osiossa voi myös tarkastaa käyttäjien kuukausiostoja valitsemalla haluamansa kuukauden ja vuoden, joka näyttää yhteenvedon kunkin käyttäjän ostoksien yhteishinnoista. Sen lisäksi alalaitaan ilmeentyy "Luo yhteenveto" painike, joka luo uuden HTML-tiedoston puhelimen muistiin, joka sisältää kuukausiyhteenveto taulukkomuodossa esimerkiksi tulostamista varten.

### Käyttäjä

Mikäli käyttäjä on luotu ylläpitäjän toimesta, käyttäjä voi merkata ostoksensa omaa nimeänsä painamalla.
Avautuvassa ikkunassa käyttäjä voi valita ostoksensa listasta ja vahvistaa sen, jolloin sovellus lisää tietokantaan ostoksen nimen ja hinnan sekä merkkaa nykyisen päivämäärän ostopäivämääräksi.
Käyttäjäpuoli sisältää myös kaikille avoimen työkalun, jolla käyttäjät voivat katsoa käyttäjäkohtaisen yhteenvedon tietyn kuukauden aikana tehdyistä ostoksista.
Työkalu mahdollistaa myös ostoksien poistamisen virheiden korjaamista varten.

Tämä mahdollistaa sovelluksen väärinkäytön, mutta tehtävänantajan vaatimusten mukaan sovelluksen tuli olla avoin ja helppokäyttöinen, jonka käyttö perustuu luottamukseen ja rehellisyyteen, jonka vuoksi se toteutettiin ilman rajoitteita.



