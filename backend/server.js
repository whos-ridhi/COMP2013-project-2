//Initalizing  server

const express = require("express");
const server = express();
const port = 3000;
const mongoose = require("mongoose"); //import mongoose
require("dotenv").config(); //import dot.env
const { DB_URI } = process.env;
const cors = require("cors"); //for disabling default browser security
const Product = require("./models/product"); //importing the product model schema

//Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors());

// Connect to mongodb database

mongoose.connect(DB_URI).then(() => {
    server.listen(port, () => {
      console.log(`Database is connected\nServer is running on port: ${port}`);
    });
  })
  .catch((error) => console.log("Error connecting to the database", error.message));

// Routes

// Root route
server.get("/", (request, response) => {
  response.send("Server is Live");
});

//get all products
server.get("/product", async (request, response) => {
  try {
    const products = await Product.find();
    response.send(products);
  } catch (error) {
    responce.status(500).send({ message: error.message });
  }
});

// adds a new product
server.post("/product", async (request, response) => {
  const {productName, brand, image, price} = request.body;
  const newProduct = new Product({
    productName,
    brand,
    image,
    price
  });
  try {
    await newProduct.save();
    response.send({message: `${productName} has been added`})

  } catch(error) {
    response.status(400).send({message: error.message});
  }
});

//delete a product

server.delete("/product/:id",async (request, response) => {
  const { id } = request.params;
  try{
    await Product.findByIdAndDelete(id);
    response.send({message: `Product was deleted successfully`});
  }catch(error){
    response.status(400).send({ message: error.message });
  }
});

// to get the product by id

server.get("/product/:id", async (request, response) => {
  const {id} = request.params;
  try{
    const productToEdit = await Product.findById(id);
    response.send(productToEdit);
  }catch(error){
    response.status(500).send({message: error.message});
  }
});

//patch

server.patch("/product/:id", async (request, response) => {
  const{id} = request.params;
  const{productName, brand, image, price} = request.body;
  try{
    await Product.findByIdAndUpdate(id, {
      productName,
      brand,
      image,
      price
    });
    response.send({message: `${productName} has been updated`});
  
  }catch(error){
    response.status(500).send({message: error.message});
  }
});