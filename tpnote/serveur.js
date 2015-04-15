var express = require('express');
var cons = require('consolidate');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var path = require('path')
var BSON = require('mongodb').BSONPure;

var app = express();
 var MongoClient = require('mongodb').MongoClient;
 var Server = require('mongodb').Server;
app.use(serveStatic(__dirname + '/view'));
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('html', cons.ejs);
app.set('view engine', 'html');
app.set('views',  __dirname +  '/view');
app.set('static',  __dirname +  '/view');
app.use("/styles", express.static(__dirname + '/view/css'));
app.use(express.static('view/css'));

var mongoclient = new MongoClient(new Server('localhost', 27017,
                                             {'native_parser': true}));
var db = mongoclient.db('tpnote');
var document;
mongoclient.connect('mongodb://127.0.0.1/tpnote', function(err, db) {
  if (err) throw err;
	app.get('/', function(req, res) {
	  res.render("accueil", {});
	});

	app.get('/collaborateurs', function(req, res) {
		db.collection('employe').find({motif:""}).toArray(function(err, doc) {
		console.dir(doc);
			res.render("afficheEmploye", {"list":doc});
		    //db.close(doc); 
		 });

	});
		
	app.get('/statistiques', function(req, res) {
		/*db.collection('employe').agregate({salaire:{"$avg":1}})(function(err, doc) {
			console.dir(doc);
			res.render("statistiques", {"statistiques":doc});
		});*/
		db.collection('employe').aggregate(
		{$group : {_id:null,moyenne: {$avg: "$salaire"},min: {$min: "$salaire"},max: {$max: "$salaire"}}},function(err, doc) {
			res.render("statistiques", {"statistiques":{"min":doc[0].min, "max":doc[0].max, "moyen":doc[0].moyenne}});
		}
		);
	});
	
	app.get('/collaborateurs/new', function(req, res) {
	  res.render("addEmploye", {});
	});
	
	app.get('/collaborateurs/:_id/delete', function(req, res) {
	  var id=BSON.ObjectID.createFromHexString(req.params._id);
		db.collection('employe').findOne({_id:id},function(err, doc) {
			res.render("deleteEmploye", {"employe":doc});
		});
	});


	app.get('/collaborateurs/:_id/edit', function(req, res) {
	  var id=BSON.ObjectID.createFromHexString(req.params._id);
		db.collection('employe').findOne({_id:id},function(err, doc) {
			res.render("updateEmploye", {"employe":doc});
		});
	});
	
	
	app.get('/collaborateurs/:_id', function(req, res) {
		var id=BSON.ObjectID.createFromHexString(req.params._id);
		db.collection('employe').findOne({_id:id},function(err, doc) {
			res.render("detail", {"employe":doc});
		});
		
		
	});
	
	app.get('*', function(req, res) {
	  res.send("Page not found", 404);
	});

	app.post('/collaborateurs', function(req, res) {
		req.body.salaire=parseInt(req.body.salaire);
		if (req.body.id!="") {
			var id=BSON.ObjectID.createFromHexString(req.body.id);
			if (req.body.motif!="") req.body.sortie=new Date();
			db.collection('employe').update({_id:id},{$set:{'nom':req.body.nom,
															'prenom':req.body.prenom,
															'naissance':req.body.naissance,
															'poste':req.body.poste,
															'salaire':parseInt(req.body.salaire),
															'entree':req.body.entree,
															'sortie':req.body.sortie,
															'email':req.body.email,
															'motif':req.body.motif
															}},function(err,doc){
				db.collection('employe').find({motif:""}).toArray(function(err, doc) {
					res.render("afficheEmploye", {"list":doc});
				});
			});
			
		} else {
			db.collection('employe').insert(req.body, function(err, records){
				db.collection('employe').find({motif:""}).toArray(function(err, doc) {
					res.render("afficheEmploye", {"list":doc});
				});
			});
		}
	});
	


});
mongoclient.open(function(err, mongoclient) {
	  if (err) throw err;
	  app.listen(8000);
	  console.log("Express server started on 8000");
});
