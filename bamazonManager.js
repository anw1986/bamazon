require('dotenv').config()
var mysql = require('mysql');
const {
    table
} = require('table');
var inquirer = require("inquirer")
var figlet = require('figlet');
const chalk = require('chalk');
process.stdout.write('\033c');

figlet('Bamazon!!\n\n Manager View', function (err, data) {
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
    database: process.env.bamazon_db
});

connection.connect(function (err) {
    if (err) throw err
    console.log("connected to Bamazon database")
    userchoice()
    // test()

})

function queryPromise(str, params) {
    return new Promise((resolve, reject) => {
        connection.query(str, params, (err, result, fields) => {
            if (err) reject(err);
            resolve(result);
        })
    })
}

// My test function to test code
function test() {
    var list = []

    var sql = "SELECT * FROM bamazon_db.products"

    queryPromise(sql).then(function (result) {

        for (i = 0; i < result.length; i++) {
            list.push(result[i].department_name)
        }

        inquirer.prompt([{
            name: "deptname",
            message: "select dept",
            type: "list",
            choices: list.filter(onlyUnique)
        }]).then(function (response) {
            console.log("User selected: " + response.deptname)
        })
    })

}

function userchoice() {

    inquirer.prompt([{
        name: "menuList",
        message: "Choose from the following",
        type: "list",
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product"
        ]
    }]).then(function (response) {
        var userInput = response.menuList;
        switch (userInput) {
            case "View Products for Sale":
                viewAll()
                break;
            case "View Low Inventory":
                viewLow()
                break;
            case "Add to Inventory":
                addqty()
                break;
            case "Add New Product":
                addnewItem()
                break;
            default:
                console.log("Nothing selected")
        }
    })
}

function mainMenu() {

    inquirer.prompt([{
        name: "return",
        message: "Return to main menu?",
        type: "confirm",
        default: true
    }]).then(function (response) {
        if (response.return) {
            process.stdout.write('\033c');
            userchoice()
        } else {
            connection.end()
        }
    })
}

function viewAll() {
    console.log("Viewing all items in database")
    var sql = "SELECT * FROM bamazon_db.products"

    connection.query(sql, function (err, result) {
        if (err) throw err;

        var data,
            output;

        data = [
            ['Product ID', 'Product Name', 'Unit Price', 'Qty in Stock']

        ];

        for (i = 0; i < result.length; i++) {
            data.push([result[i].item_id, result[i].product_name, result[i].price, result[i].stock_quantity])
        }

        output = table(data);
        console.log(output);
        mainMenu()
    })
}

function viewLow() {
    console.log("Items with quantity less than 5")
    var sql = "SELECT * FROM bamazon_db.products WHERE stock_quantity<=5"

    connection.query(sql, function (err, result) {
        if (err) throw err;

        var data,
            output;

        data = [
            ['Product ID', 'Product Name', 'Unit Price', 'Qty in Stock']

        ];

        for (i = 0; i < result.length; i++) {
            data.push([result[i].item_id, result[i].product_name, result[i].price, result[i].stock_quantity])
        }

        output = table(data);
        console.log(output);
        mainMenu()
    })
}

function addqty() {

    var sql = "SELECT * FROM bamazon_db.products"
    connection.query(sql, function (err, result) {

        if (err) throw err

        inquirer.prompt([{
                name: "productName",
                type: "rawlist",
                message: "Please choose which item would you like to add inventory",
                choices: function () {
                    var choiceArray = []
                    for (var i = 0; i < result.length; i++) {
                        choiceArray.push(result[i].product_name)
                    }
                    return choiceArray;
                }

            },
            {
                name: "qty",
                type: "number",
                message: "Enter quantity",
                validate: function (value) {
                    if (isNaN(value) || !(Number.isInteger(value))) {
                        return "Please enter valid quantity"
                    } else return true
                }
            }
        ]).then(function (response) {
            var userChoice = response.productName
            var userQty = response.qty
            connection.query("SELECT * FROM bamazon_db.products WHERE product_name=?", [userChoice], function (err, resultchoice) {
                if (err) throw err
                var qtyDB = resultchoice[0].stock_quantity
                console.log(chalk.redBright.bold("Current qty in stock: " + qtyDB))
                var qtyUpdate = qtyDB + userQty
                if (qtyUpdate < 0) {
                    console.log("The total amount is less then zero. Record not updated")
                    addqty()
                } else {

                    connection.query("UPDATE bamazon_db.products SET stock_quantity=? WHERE product_name=?", [qtyUpdate, userChoice], function (err, resuultdb) {
                        if (err) throw err;

                        console.log(resuultdb.affectedRows + " record(s) updated")
                        console.log(chalk.greenBright.bold("New qty in stock: " + qtyUpdate))
                        mainMenu()
                    })

                }

            })
        })
    })

}

function addnewItem() {

    console.log("Please enter new item details to be added")

    var list = []

    var sql = "SELECT * FROM bamazon_db.products"

    queryPromise(sql).then(function (result) {

        for (i = 0; i < result.length; i++) {
            list.push(result[i].department_name)
        }

        inquirer.prompt([{
                name: "productName",
                message: "Please enter product name",
                type: "input",
                validate: function (value) {
                    if (value === "") {
                        return "This cannot be blank"
                    } else return true
                }

            },
            {
                name: "deptname",
                message: "select dept",
                type: "list",
                choices: list.filter(onlyUnique)

            },
            {
                name: "unitPrice",
                message: "Please enter unit price",
                type: "number",
                validate: function (value) {
                    if (isNaN(value) || value < 0) {
                        return "Please enter valid quantity"
                    } else return true
                }
            },
            {
                name: "unitQty",
                message: "Please enter product qty",
                type: "number",
                validate: function (value) {
                    if (isNaN(value) || !(Number.isInteger(value))) {
                        return "Quantity should be integer"
                    } else return true
                }
            }
        ]).then(function (response) {
            var sql = "INSERT INTO bamazon_db.products SET ?";
            connection.query(sql, {
                product_name: response.productName,
                department_name: response.deptname,
                price: response.unitPrice,
                stock_quantity: response.unitQty
            }, function (err) {
                if (err) throw err
                console.log("Your item has been added successfully!")
                mainMenu()
            })
        })
    })

}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}