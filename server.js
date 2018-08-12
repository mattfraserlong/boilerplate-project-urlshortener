//https://url-shortener-microservice-ml.glitch.me/api/shorturl/new/www.google.com
// model answer: https://github.com/chemok78/url-shortener/blob/master/api/shortener.js

'use strict';

//init
var express = require('express');
var mongoDb = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var cors = require('cors');
var dns = require('dns');
var app = express();
var appUrl = 'https://url-shortener-microservice-ml.glitch.me/'

//"MongoClient" interface in order to connect to a mongodb server.
//Using MongoDB's native driver
var MongoClient = mongoDb.MongoClient;

var port = process.env.PORT || 3000;

//Use Cors to allow cross-origin connections
app.use(cors());

// connect to mongoDB and log failure/success
mongoose.connect(process.env.MONGOLAB_URI, function(error){
  var shortUrl;
  var uniqueId;
  
  if(error){
    console.log(error)
  };
  console.log("Connection successful");
  
  //listen for get request on endpoint with longUrl
  //https://url-shortener-microservice-ml.glitch.me/api/shorturl/new/www.google.com
  app.get('/api/shorturl/new/:longUrl(*)', function(req, res) {
      
    //get URL to shorten off request (params)
    var longUrl = req.params.longUrl;

      
    /*----write to database----*/
    //Bind MongoDb to var db
    var db = mongoose.connection;
    var collection = db.collection('shorturls');
      
    // count current documents in collection and + 1 to create uniqueId
    collection.count(function(err, result) {
      if (err) {
        console.log("Error counting db collection docs")
      } else {
        console.log("result of document count = " + result);
        var uniqueId =  result + 1;
        var shortUrl = appUrl + uniqueId;
      }
    
      //test if URL valid. Then respond with json error or shortened URL
      dns.lookup(longUrl, function (err, addresses, family) {
        if (err) {
          res.json({"error": "invalid URL"});
          console.log("invalid url");
        } else {
          res.json({"original_url":longUrl,"short_url":shortUrl});
          console.log("valid url");
        };
        
        //create collection shorturls
        var shorturls = {
          longUrl: longUrl,
          shortUrl: shortUrl,
          uniqueId: uniqueId
        };

        //insert tinyurls into database
        collection.insert(shorturls, function(err, result) {
          //insert the short URL object in database
          if (err) {
            console.log(err);
          } else {
            console.log('Inserted document number ' + uniqueId);
          }
        });
      });   
    });
  });
  
/*-----end of longUrl get request-----*/

/*-----start of shortUrl get requests----*/
//shortUrl for tests:  https://url-shortener-microservice-ml.glitch.me/api/shorturl/3
//listen for get request on endpoint with shortUrl
app.get('/api/shorturl/:shortUrl', function(req, res) {
  var db = mongoose.connection;
  var shortUrl = req.params.shortUrl;
  //res.json({"shortUrl": shortUrl});
  var toFind = parseInt(shortUrl);
    
  //find uniqueId
  db.collection("shorturls").findOne({uniqueId: toFind}, function(err, data) {
    if(err) return res.send("error reading database");
    
    var redirectUrl = data.longUrl;
    
    res.redirect(301, "https://" + redirectUrl);
    
  });
  });
});




/*
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
