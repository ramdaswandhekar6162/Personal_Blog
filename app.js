//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Ram:Test-123@cluster0.h4zfrej.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name : String
});

const listSchema = new mongoose.Schema({
  name : String,
  items : []
});

const Item = mongoose.model("Item",itemSchema);

const List = mongoose.model("List",listSchema);

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const task1 = new Item ({
  name : "WeakUp at 7:30"
});

const task2 = new Item ({
  name : "Freash"
});

const task3 = new Item({
  name : "Ready for Next Task"
});

const defaultItems = [task1,task2,task3];

// Item.insertMany(defaultItems,function(err){
//   if(err)
//   {
//     console.log(err);
//   }
//   else
//   {
//     console.log("Sucesfully enter the data");
//   }
// });

const insertDocument = async function(arr)
{
  try {
    await Item.insertMany(arr); 
  } catch (err) {
    console.log(err);
  }
}
//insertDocument(defaultItems);

async function myTodolist() {
  const itemList = Item.find({});

  (await itemList).forEach(function(itemL){
    console.log(itemL.name);
  });
}

//myTodolist();
app.get("/", async function(req, res) {

   let  items = await Item.find({});

   try {
      if(items.length === 0)
      {
        await Item.insertMany(defaultItems);
        res.redirect("/");
      }
      else{
        res.render("list",{listTitle: "Today",newListItems : items});
      }
   } catch (err) {
      console.log(err);
   }
   //console.log(items);
  //res.render("list", {listTitle: "Today", newListItems: items});
});

app.get("/:customListName", async function(req,res){

  const customListName = _.capitalize(req.params.customListName);
  const findList = await List.findOne({name : customListName}) ;
  if(!findList)
  {
    //Create a new List
    const list = new List({
      name : customListName,
      items : defaultItems
    });
   list.save();
   res.redirect("/" + customListName);
  }
  else
  {
    res.render("list",{listTitle : findList.name, newListItems : findList.items});
  }

});

app.post("/delete", async function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listTitle = req.body.listName;

  if (listTitle === "Today") {
    try {
      await Item.findByIdAndRemove(checkedItemId);
      res.redirect("/");
    } catch (err) {
      console.error(err);
    }
  } else {
    try {
      const list = await List.findOne({ name: listTitle });

      if (!list) {
        res.status(404).send("List not found.");
        return;
      }

      // Find the index of the item to remove
      const indexToRemove = list.items.findIndex(item => item && item._id && item._id.toString() === checkedItemId);

      if (indexToRemove === -1) {
        res.status(404).send("Item not found in the list.");
        return;
      }

      // Remove the item from the array
      list.items.splice(indexToRemove, 1);

      // Save the updated document
      await list.save();

      res.redirect("/" + listTitle);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  }
});




app.post("/",async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
 
  const item = new Item({
    name : itemName
  });
 
  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    const foundList = await List.findOne({name:listName});
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;

if(port == null || port == "" || port == " "){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
