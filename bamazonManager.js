require('dotenv').config()
var mysql = require('mysql');
const {
    table
} = require('table');
var inquirer = require("inquirer")
var figlet = require('figlet');
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
    })
}

function addqty() {
    console.log("Add qty to the items")
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
                type: "input"
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
            console.log(response)
        })
    })

}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

