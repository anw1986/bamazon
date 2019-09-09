require('dotenv').config()
var mysql = require('mysql');
const {
    table
} = require('table');
var inquirer = require("inquirer")
var figlet = require('figlet');
const chalk = require('chalk');
process.stdout.write('\033c');

figlet('Bamazon!!', function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data)
});

var connection = mysql.createConnection({
    host: process.env.db_host,
    port: process.env.db_port,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name
});

connection.connect(function (err) {
    if (err) throw err
    console.log("connected to Bamazon database")
    
    viewAllItems()
})


function viewAllItems() {

    var sql = "SELECT * FROM bamazon_db.products"


    connection.query(sql, function (err, result) {
        if (err) throw err;

        var data, output;

        data = [
            [chalk.greenBright.bold('Product ID'), chalk.greenBright.bold('Product Name'), chalk.greenBright.bold('Unit Price'), chalk.greenBright.bold('Qty in Stock')]

        ];

        for (i = 0; i < result.length; i++) {
            data.push([result[i].item_id, result[i].product_name, result[i].price, result[i].stock_quantity])
        }

        output = table(data);
        console.log(output);

        customerPrompt()
    })

}

function customerPrompt() {

    connection.query("SELECT * FROM bamazon_db.products", function (err, resultdb) {
        if (err) throw err;


        inquirer.prompt([{
                name: "productID",
                message: "Which product would you like to buy, Choose an ID?",
                type: "list",
                choices: function () {
                    var choiceArray = []
                    for (var i = 0; i < resultdb.length; i++) {
                        choiceArray.push(resultdb[i].item_id)
                    }
                    return choiceArray;
                }
            },
            {
                name: "qty",
                message: "How many units of the product you would like to buy?",
                type: "number",
                validate: function (value) {
                    if (isNaN(value) || !(Number.isInteger(value))||value<0) {
                        return "Please enter valid quantity"
                    } else return true
                } 
            }

        ]).then(function (responseID) {
            var itemID = responseID.productID
            var quantity = responseID.qty

            connection.query("SELECT * FROM bamazon_db.products WHERE item_id=?", [itemID], function (err, result) {
                var stockQuantity = result[0].stock_quantity
                var UnitPrice = result[0].price;
                var total = UnitPrice * quantity;
                var updateQuantity = stockQuantity - quantity
                var data,
                    output;
                if (stockQuantity <= 0 || stockQuantity < quantity) {
                    console.log("Sorry, insufficient quantity in store. Your order cannot be fulfilled")
                    inquirer.prompt([{
                        name: "continue",
                        message: "Would you like to shop other products",
                        type: "confirm",
                        default: true
                    }]).then(function (answer) {
                        if (answer.continue) {
                            process.stdout.write('\033c');
                            viewAllItems()
                        } else {
                            console.log("Hope to see you next time")
                            connection.end()
                        }
                    })
                } else {


                    data = [
                        ['Product ID', 'Product Name', 'Unit Price', 'Qty Purchased', 'Total($)']

                    ];

                    data.push([result[0].item_id, result[0].product_name, result[0].price, quantity, total])
                    output = table(data);
                    console.log(output);
                    connection.query("UPDATE bamazon_db.products SET stock_quantity=? WHERE item_id=?", [updateQuantity, itemID], function (err, x) {
                        if (err) throw err;
                        console.log(x.affectedRows + " record(s) updated");

                        inquirer.prompt([{

                            name: "restart",
                            message: "Would you like to buy more items",
                            type: "confirm",
                            default: true

                        }]).then(function (response) {

                            if (response.restart) {
                                viewAllItems()
                            } else connection.end()
                        })
                    })

                }


            })

        })
    })

}