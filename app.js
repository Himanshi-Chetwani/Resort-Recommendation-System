var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j =  require('neo4j-driver').v1;
var app = express();


var category;
var month;
var rating;
var resortArr = [];

//View Enginer
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j','password'));
var session = driver.session();
app.get('/',function(req,res){
    res.render('index')
});

app.post('/result', function(req, res){
    console.log("******************RESULT:****************");
    console.log(req.body);
    category = req.body.Category;
    month = req.body.Month;
    rating = req.body.Rating;
    session
        .run(`MATCH (a:Resort)-[:CATEGORY]->(c:Category),
        (a:Resort)-[:PLACE]->(p:Place),
        (p:Place)-[:BEST_SEASON]->(s:Season),
        (a:Resort)-[:RATING]->(b:Rating)
        WHERE c.name='Lake' AND s.name= 'October' AND b.rating > 2
        RETURN 
            a
        ORDER BY b.rating DESC`)
        .then(function(result){
            console.log("Before push");
            result.records.forEach(function(record){
                console.log("inside Push");
                resortArr.push({
                    id: record._fields[0].identity.low,
                    name: record._fields[0].properties.name,
                    address: record._fields[0].properties.address,
                    avg_rating: record._fields[0].properties.avg_rating
                })
                console.log("QUERY RESULT *****************:");
                console.log(record._fields[0].properties);
                console.log("Resorts array", resortArr);
                
            });
        })
        .catch(function(err){
            console.log(err);
            
        }); 
    
   console.log("Resorts array", resortArr);
    res.render("result", {
        resorts: resortArr
    });
})

app.listen(3000);
console.log('Server started on port 3000');

module.exports = app;



 