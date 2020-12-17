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
let remaining_gifts = [];
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
app.get("/",function(req,res){ 
    round_count = 1;
    people_count = 0;
    dict = {};
    gift_dict ={};
    next_players = [];
    gifts = [];
    remaining_gifts = [];
    res.render("index"); 
}) 
    
app.get("/begin",function (req, res, next) { 
    original_list = tools.convert();
    //console.log(original_list);
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
app.get('/shuffledgifts', function (req, res, next) { 
    //console.log("here shuffled");
    remaining_gifts = tools.shuffle(remaining_gifts);
    let name = next_players[people_count];
    res.render('spin_wheel',{list:next_players,count:round_count,name:name,available_gifts:remaining_gifts}); 
});
app.get('/start', function (req, res, next) { 
    //console.log("here get start");
    if(round_count > 5) {
        let name = next_players[people_count];
        console.log(remaining_gifts);
        res.render('spin_wheel',{count:round_count,name:name,available_gifts:remaining_gifts}); 
    }
    else {
        let name = next_players[people_count];
        //console.log("gift dict for player " + name + " is "+ gift_dict[name]);
        res.render('start',{count:round_count,name:name,available_gifts:gift_dict[name]}); 
    }
});
app.get('/next_players', function (req, res, next) { 
  
    res.render('list',{count:round_count,list:next_players}); 
});
app.get('/lastround', function (req, res, next) { 
    if(people_count<next_players.length-1) {
        let name = next_players[people_count];
        dict[remaining_gifts[0]] = dict[remaining_gifts[0]] || [];
        dict[remaining_gifts[0]].push(name);
        remaining_gifts.splice(0, 1);
        people_count++;
        name = next_players[people_count];
        console.log(remaining_gifts);
        res.render('spin_wheel',{count:round_count,name:name,available_gifts:remaining_gifts}); 
    }
    else {
        let new_list = [];
        dict[remaining_gifts[0]] = dict[remaining_gifts[0]] || [];
        let name = next_players[people_count];
        dict[remaining_gifts[0]].push(name);
        remaining_gifts.splice(0, 1);
        people_count = 0;
        for(let i=1;i<=original_list.length;i++) {
            let res = dict[i.toString()] || [];
            new_list.push(res.join());
        }
        res.render('result',{count:round_count,list:new_list,original_list}); 
    }
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
        console.log("dict is "+dict);
        //console.log("gift dict for player " + new_name + " is "+ gift_dict[new_name]);
        res.render('start',{count:round_count,name:new_name,available_gifts:gift_dict[new_name]});
    }
    else {
        let name = next_players[people_count];
        dict[req.body.giftNo] = dict[req.body.giftNo]|| [];
        dict[req.body.giftNo].push(name);
        console.log(dict);
        let new_list = [];
        if(round_count < 5)
        {
            let name = next_players[people_count];
            let g = gift_dict[name].indexOf(parseInt(req.body.giftNo));
            //console.log(gift_dict);
            if (g > -1) {
                gift_dict[name].splice(g, 1);
            }
            
            //console.log(gift_dict);
            //console.log("after remove for player "+ name + "is " + gift_dict[name]);
            for(let i=1;i<=original_list.length;i++) {
                let res = dict[i.toString()] || [];
                new_list.push(res.join());
            }
            let new_players = [];
            for(let i=1;i<=original_list.length;i++) {
                let res = dict[i.toString()] || [];
                //console.log("res is"+ res);
                if(res.length > 1) {
                    let some = res.slice(0,res.length-1);
                    //console.log("some is ",some);
                    new_players = new_players.concat(some);
                }
                //console.log(new_players);
            }
            for(let i=1;i<=original_list.length;i++) {
                let res = dict[i.toString()] || [];
                if(res.length > 1) {
                    res.splice(0,res.length-1);
                    dict[i.toString()] = res;
                }
            }
            next_players = new_players;
        }
        else if(round_count >= 5) {
            let final_players = [];
            for(let i=1;i<=original_list.length;i++) {
                let res = dict[i.toString()] || [];
                new_list.push(res.join());
            }
            let c = 0;
            for(let i=1;i<=original_list.length;i++) {
                let res = dict[i.toString()] || [];
                //console.log("res is"+ res);
                if(res.length > 1) {
                    //console.log("some is ",some);
                    c++;
                    final_players = final_players.concat(res);
                }
                //console.log(final_players);
            }
            for(let i=1;i<=original_list.length;i++) {
                let res = dict[i.toString()] || [];
                if(res.length !=1) {
                    remaining_gifts.push(i);
                    dict[i.toString()] = [];
                }
            }
            console.log("gifts ",remaining_gifts);
            next_players = final_players;
        }
        round_count++;
        people_count = 0;
        res.render('result',{count:round_count,list:new_list,original_list}); 
    }
     
});
app.listen(port, () => console.log(`Listening on port ${port}...`));