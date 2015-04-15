var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;

var mongoclient = new MongoClient(new Server('localhost', 27017,{'native_parser': true}));
var db = mongoclient.db('tpnote');

//problème de callback.
mongoclient.connect('mongodb://127.0.0.1/tpnote', function(err, db) {
  if (err) throw err;
for(i=1; i<=10; i++){
	db.collection('employe').insert({id:i,prenom:"prenom"+i,nom:"nom"+i,naissance:new Date("13/04/1890"),poste:"poste"+i,salaire:2000+i*i*i,entree: new Date("13/04/2015"), sortie: new Date("13/04/2015"),num_arrive: i, mail:"toto@gmail.com" }, function(err){})
}
  db.collection('employe').find({}, function(err, doc) {
    console.dir(doc);
    db.close(doc); 
  });
});
