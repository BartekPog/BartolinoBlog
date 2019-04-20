 //jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-bart:testingthings@cluster0-qlwuz.mongodb.net/PogodinoWebDB", {useNewUrlParser: true});

const postSchema={
  myID:Number,
  title:String,
  content: String,
  extend:Boolean
};
const Post= mongoose.model("Post", postSchema);

app.get("/",function(req,res){
  Post.findOne({myID: 0},function(err,post){
    if ((err)||(post==null)) res.render("err");
    else{
      res.render("landing", {pierwszy: post.title});
    }
  });
});

app.get("/posts/:nazwaPosta", function(req,res){
  const nazwaPosta=_.capitalize(req.params.nazwaPosta);
  Post.findOne({title:nazwaPosta}, function(err,post){
    if ((err)||(post==null)) res.render("err");
    else{
      Post.findOne({myID:(post.myID + 1)}, function(err, kolejny){
        if (err) res.render("err");
        else{
          if (kolejny==null) res.render("post", {post:post, kolejny:"-1"});
          else res.render("post", {post:post, kolejny:kolejny.title});
        }
      });
    }
  });
});

app.get("/list", function(req,res){
  Post.find({}, function(err,posts){
    if(err) res.render("err");
    else res.render("list", {posts:posts});
  });

});

app.get("/about", function(req,res){
  res.render("about");
});
app.get("/contact", function(req,res){
  res.render("contact");
});

app.get("/nowyPost",function (req,res){
  res.render("nowy",{post:{
    title:"",
    content:"",
    extend:false,
    myID: "-1"
  }});
});

app.get("/posts/:nazwaPosta/edytujPost", function(req,res){
  const nazwaPosta=_.capitalize(req.params.nazwaPosta);
  Post.findOne({title:nazwaPosta},function(err, post){
    if ((err)||(post==null)) res.render("err");
    else res.render("nowy", {post:post});
  });
});

app.post("/nowyPost", function(req,res){
  if( req.body.myID=="-1"){
    Post.countDocuments({},function(err,count){
      if(err) res.render("err");
      else{
        const otrzymanyPost=new Post({
          myID:count,
          title: _.capitalize(req.body.title),
          content: req.body.content,
          extend: req.body.extend
        });
        otrzymanyPost.save();
        res.redirect("/posts/"+otrzymanyPost.title);
      }
    });
  }else{
    Post.updateOne({myID: req.body.myID}, {
      title: _.capitalize(req.body.title),
      content: req.body.content,
      extend: req.body.extend}, function(err, post){
        if(err) res.render("err");
        else{
          res.redirect("/posts/"+_.capitalize(req.body.title));
        }
    });
  }
});
app.get("/posts/:nazwaPosta/usunPost", function(req,res){
  const nazwaPosta=_.capitalize(req.params.nazwaPosta);
  Post.findOne({title: nazwaPosta}, function(err, post){
    if ((err)||(post==null)) res.render("err");
    else{
      const numerPosta=post.myID;
      Post.deleteOne({myID: numerPosta}, function(err){
        if(err) res.render("err");
        else{
          Post.find({myID:{$gt:numerPosta}}, function(err, posty){
            if(err) res.render("err");
            else{
              posty.forEach(function(post){
                post.myID=post.myID-1;
                post.save();
              });
            res.redirect("/list");
            }
          });
        }
      });

    }
  });

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started succesfully");
});
