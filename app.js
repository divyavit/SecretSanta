const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
let tools = require('./shuffle');
let fs = require('fs');
var bodyParser = require('body-parser');
const { json } = require('express');
let round_count = 1;
let people_count = 0;
let dict = {};
let gift_dict = {};
let next_players = [];
//dict.clear();
let gifts = [];
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use("/styles",express.static(__dirname + "/styles"));
app.use("/scripts",express.static(__dirname + "/scripts"));
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs').__express);
app.set('view engine','ejs')    
var storage = multer.diskStorage({ 
    destination: function (req, file, cb) { 
        cb(null, "uploads") 
    }, 
    filename: function (req, file, cb) { 
      cb(null, "emp"+ ".xlsx");
    } 
  }) 
let original_list = [];
const maxSize = 1 * 1000 * 1000; 
    
var upload = multer({  
    storage: storage, 
    limits: { fileSize: maxSize }, 
}).single("mypic");        
  
app.get("/",function(req,res){ 
    round_count = 1;
    people_count = 0;
    dict = {};
    gift_dict ={};
    next_players = [];
    gifts = []
    res.render("index"); 
}) 
    
app.post("/list",function (req, res, next) { 
    upload(req,res,function(err) { 
  
        if(err) { 
            res.send(err) 
        } 
        else { 
            //res.send("Success, Image uploaded!") 
            original_list = tools.convert();
            next_players = original_list;
            for(let i=1;i<=original_list.length;i++) {
                gifts.push(i);
            }
            for(let i=0;i<original_list.length;i++) {
                gift_dict[original_list[i]] = gift_dict[original_list[i]]|| [];
                for(let j=1;j<=original_list.length;j++) {
                    gift_dict[original_list[i]].push(j);
                }    
            }
            res.render('list',{list:original_list,count:round_count});
        } 
    }) 
}) 
app.get('/list', function (req, res, next) { 
    //console.log("here list");
    
    res.render('list',{list:next_players,count:round_count}); 
});
app.get('/shuffled', function (req, res, next) { 
    //console.log("here shuffled");
    next_players = tools.shuffle(next_players);
    res.render('list',{list:next_players,count:round_count}); 
});
app.get('/start', function (req, res, next) { 
    //console.log("here get start");
    let name = next_players[people_count];
    console.log("gift dict for player " + name + " is "+ gift_dict[name]);
    res.render('start',{count:round_count,name:name,available_gifts:gift_dict[name]}); 
});
app.get('/next_players', function (req, res, next) { 
  
    res.render('list',{count:round_count,list:next_players}); 
});
app.post('/input',urlencodedParser,jsonParser, function (req, res, next) { 
    //console.log("here post input");
    if(people_count<next_players.length-1) {
        //console.log(req.body.giftNo);
        //console.log("new players for current round "+ next_players);
        let name = next_players[people_count];
        dict[req.body.giftNo] = dict[req.body.giftNo]|| [];
        let g = gift_dict[name].indexOf(parseInt(req.body.giftNo));
        //console.log(gift_dict);
        if (g > -1) {
            gift_dict[name].splice(g, 1);
        }
        //console.log(gift_dict);
        //console.log("after remove for player "+ name + "is " + gift_dict[name]);
        dict[req.body.giftNo].push(name);
        people_count++;
        let new_name = next_players[people_count];
        //console.log("gift dict for player " + new_name + " is "+ gift_dict[new_name]);
        res.render('start',{count:round_count,name:new_name,available_gifts:gift_dict[new_name]});
    }
    else {
        let name = next_players[people_count];
        let g = gift_dict[name].indexOf(parseInt(req.body.giftNo));
        //console.log(gift_dict);
        if (g > -1) {
            gift_dict[name].splice(g, 1);
        }
        //console.log(gift_dict);
        //console.log("after remove for player "+ name + "is " + gift_dict[name]);
        dict[req.body.giftNo] = dict[req.body.giftNo]|| [];
        dict[req.body.giftNo].push(name);
        people_count = 0;
        let new_players = [];
        for(let i=1;i<=original_list.length;i++) {
            let res = dict[i.toString()] || [];
            console.log("res is"+ res);
            if(res.length > 1) {
                let some = res.slice(0,res.length-1);
                console.log("some is ",some);
                new_players = new_players.concat(some);
            }
            console.log(new_players);
        }
        let new_list = [];
        for(let i=1;i<=original_list.length;i++) {
            let res = dict[i.toString()] || [];
            new_list.push(res.join());
        }
        for(let i=1;i<=original_list.length;i++) {
            let res = dict[i.toString()] || [];
            if(res.length > 1) {
                res.splice(0,res.length-1);
                dict[i.toString()] = res;
            }
        }
        next_players = new_players;
        round_count++;
        res.render('result',{count:round_count,available_gifts:gift_dict[name],list:new_list,original_list}); 
    }
     
});
app.listen(port, () => console.log(`Listening on port ${port}...`));