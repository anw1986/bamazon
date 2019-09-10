DROP DATABASE IF EXISTS test_bamazon_db;
CREATE DATABASE test_bamazon_db;
USE test_bamazon_db;
CREATE TABLE products(
item_id INTEGER AUTO_INCREMENT NOT NULL,
product_name VARCHAR(100),
department_id INT NOT NULL,
price FLOAT,
stock_quantity INT,
product_sales INT,
PRIMARY KEY(item_id),
FOREIGN KEY(department_id) REFERENCES departments(department_id)
);

INSERT INTO products (product_name,department_id,price,stock_quantity,product_sales) VALUES ("Horizon Whole Milk",2,5,20,200);
INSERT INTO products (product_name,department_id,price,stock_quantity,product_sales) VALUES ("Banana",5,1.99,100,300);
INSERT INTO products (product_name,department_id,price,stock_quantity,product_sales) VALUES ("Tomatoes",3,1.99,500,400);
INSERT INTO products (product_name,department_id,price,stock_quantity,product_sales) VALUES ("Onions",3,3,70,500);
INSERT INTO products (product_name,department_id,price,stock_quantity,product_sales) VALUES ("Potatoes",3,2.99,40,600);
INSERT INTO products (product_name,department_id,price,stock_quantity,product_sales) VALUES ("Fresh Orange Juice",6,4.99,50,700);
INSERT INTO products (product_name,department_id,price,stock_quantity,product_sales) VALUES ("Pamper Swaddler Diaper",4,5,20,800);
INSERT INTO products (product_name,department_id,price,stock_quantity,product_sales) VALUES ("HiPP Baby Formula",4,38.99,70,900);
INSERT INTO products (product_name,department_id,price,stock_quantity,product_sales) VALUES ("Chicken Breast 8 Pcs",7,3.99,20,1000);
INSERT INTO products (product_name,department_id,price,stock_quantity,product_sales) VALUES ("Iphone 10",1,899.99,20,1500);
INSERT INTO products (product_name,department_id,price,stock_quantity,product_sales) VALUES ("70in 4k LG TV",1,599.99,20,2000);

CREATE TABLE test_bamazon_db.departments(
department_id INTEGER AUTO_INCREMENT NOT NULL,
department_name VARCHAR(100),
over_head_costs INT,
PRIMARY KEY(department_id)
);

INSERT INTO departments (department_name,over_head_costs) VALUES ("Electronics",10000);
INSERT INTO departments (department_name,over_head_costs) VALUES ("Dairy",40000);
INSERT INTO departments (department_name,over_head_costs) VALUES ("Vegetable",50000);
INSERT INTO departments (department_name,over_head_costs) VALUES ("Baby",4000);
INSERT INTO departments (department_name,over_head_costs) VALUES ("Fruit",8000);
INSERT INTO departments (department_name,over_head_costs) VALUES ("Juice",9000);
INSERT INTO departments (department_name,over_head_costs) VALUES ("Produce",11000);
INSERT INTO departments (department_name,over_head_costs) VALUES ("Clothing",1000);
INSERT INTO departments (department_name,over_head_costs) VALUES ("Home Decor",2000);

SELECT * FROM test_bamazon_db.departments;
SELECT * FROM test_bamazon_db.products; 

SELECT products.item_id, products.product_name, products.price,products.stock_quantity,products.product_sales,department_name
FROM test_bamazon_db.products
JOIN departments ON products.department_id=departments.department_id;

SELECT departments.department_name,departments.over_head_costs, round(SUM( products.product_sales*products.price),2)  AS product_sales, round(SUM( products.product_sales*products.price)-departments.over_head_costs,2)  AS total_profit
FROM departments
JOIN products ON products.department_id=departments.department_id
GROUP BY department_name ORDER BY total_profit DESC ;

UPDATE test_bamazon_db.products SET stock_quantity=4 wHERE item_id=10;

SELECT products.item_id, department_name, products.product_name, products.price,products.stock_quantity,products.product_sales FROM test_bamazon_db.products JOIN departments ON products.department_id=departments.department_id ORDER BY department_name ASC, product_name DESC ;
