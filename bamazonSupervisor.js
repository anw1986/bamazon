require('dotenv').config()
var mysql = require('mysql');
const {
    table
} = require('table');
var inquirer = require("inquirer")
var figlet = require('figlet');
const chalk = require('chalk');
process.stdout.write('\033c');

figlet('Bamazon!!\n\n Supervisor View', function (err, data) {
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
    userchoice()

})

function userchoice() {

    inquirer.prompt([{
        name: "menuList",
        message: "Choose from the following",
        type: "list",
        choices: [
            "View Product Sales by Department",
            "Create new department",
            "Exit"
        ]
    }]).then(function (response) {
        var userInput = response.menuList;
        switch (userInput) {
            case "View Product Sales by Department":
                salesDept()
                break;
            case "Create new department":
                createNew()
                break;
            default:
                connection.end()
        }
    })
}

function createNew() {
    console.log("New department details")
    inquirer.prompt([{
            name: "deptname",
            message: "Enter new department name",
            type: "input",
            validate: function (value) {
                if (value === "") {
                    return "This cannot be blank"
                } else return true
            }
        },
        {
            name: "overHead",
            message: "Please enter over head cost for the department",
            type: "number",
            validate: function (value) {
                if (isNaN(value) || value < 0) {
                    return "Please enter valid quantity"
                } else return true
            }
        }
    ]).then(function (response) {
        var sql = "INSERT INTO bamazon_db.departments SET ?";
        connection.query(sql, {
            department_name: response.deptname,
            over_head_costs: response.overHead
        }, function (err) {
            if (err) throw err
            console.log("Department has been added!!!")
            mainMenu()
        })
    })
}

function salesDept() {
    var sql = "SELECT departments.department_name,departments.over_head_costs,round(SUM( products.product_sales*products.price),2) AS product_sales, round(SUM( products.product_sales*products.price)-departments.over_head_costs,2) AS total_profit FROM departments JOIN products ON products.department_id = departments.department_id GROUP BY department_name ORDER BY total_profit DESC"
    connection.query(sql, function (err, resultdb) {
        if (err) throw err
        var data,
            output;

        data = [
            ['Department Name', 'Over Head Costs', 'Product Sales($)', 'Profit/Loss']

        ];

        for (var i = 0; i < resultdb.length; i++) {
            if (resultdb[i].total_profit<0){
                data.push([resultdb[i].department_name, resultdb[i].over_head_costs, resultdb[i].product_sales, chalk.redBright.bold(resultdb[i].total_profit)]) 
            }else{
                data.push([resultdb[i].department_name, resultdb[i].over_head_costs, resultdb[i].product_sales, chalk.greenBright.bold(resultdb[i].total_profit)]) 
            } 

            
        }

        output = table(data);
        console.log(output);
        mainMenu()
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