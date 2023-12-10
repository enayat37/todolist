const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();



app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect('mongodb+srv://admin-enayat:Test123@cluster0.zjydvdj.mongodb.net/todolistDB');

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to Your Todolist Enayat!"
});
const item2 = new Item({
    name: "What Do You Want for Today!"
});
const item3 = new Item({
    name: "What is New Today!"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {


    Item.find({})
         
       .then (function(foundItems) {

        if(foundItems.length === 0) {
            Item.insertMany(defaultItems).then(function() {
                console.log("Successfully inserted!");
            }).catch(function(err) {
                console.log(err);
            });
            res.redirect("/");
         } else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
         }
         
    })
       .catch(function(err) {

        console.log(err);
        
    });

});

app.get("/:customListName", function(req, res) {
    
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}) 
      .then(function(foundList) {
        if(foundList) {
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        } else {
            const list = new List({
                name: customListName,
                items : defaultItems
            });

             list.save();
             res.redirect("/" + customListName);
        }
      }) 
       .catch (function (err) {
          console.log(err);
     })


});


app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item ( {
        name: itemName
    });

    if(listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}) 
          .then (function(foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
          })
          .catch (function(err) {
            console.log(err);
          })
    }

});

app.post("/delete", function(req, res) {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today") {
        Item.findByIdAndDelete(checkedItemId)
        .then (function(deletedItem) {
            if(deletedItem) {
                console.log("successfully deleted!");
                res.redirect("/");
            } else {
                console.log("Item not found!");
            }
        })
        .catch (function(err) {
            console.log(err);
        })
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}) 
           .then (function(foundList) {
              res.redirect("/" + listName);
           }) 
           .catch (function(err) {
             
           })
    }


});




app.get("/about", function(req, res) {
    res.render("about");
});




let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
    console.log("Server has started successfully");
});

// Test123 admin-enayat