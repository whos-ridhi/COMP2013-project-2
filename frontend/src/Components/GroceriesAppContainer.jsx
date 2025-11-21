import { useState, useEffect } from "react";
import CartContainer from "./CartContainer";
import ProductsContainer from "./ProductsContainer";
import NavBar from "./NavBar";
import axios from "axios";
import ProductForm from "./ProductForm";

export default function GroceriesAppContainer() {

  //import products state
  const [product, setProduct] = useState([]);
  //post response
  const [postResponse, setPostResponse] = useState([]);
  //product quantity
  const [productQuantity, setProductQuantity] = useState({});
  //editing toggle
  const [isEditing, setIsEditing] = useState(false);
  //cartlist
  const [cartList, setCartList] = useState([]);
  //form
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    image: "",
    price: "",
  });

  //useEffects
  useEffect(() => {
    handleProductDB();
  }, [postResponse]); 

  //handlers
  //connecting to products database
  // get data from db handler
  const handleProductDB = async () => {
    try {
      const response = await axios.get("http://localhost:3000/product");

      console.log(response);
      setProduct(response.data);
      setProductQuantity(
        response.data.map((product) => ({ id: product.id, quantity: 0 }))
      ); // to define the quantity
    } catch (error) {
      console.log(error.message);
      console.error("Error fetching products:", error);
    }
  };

  const handleAddQuantity = (productId, mode) => {
    if (mode === "cart") {
      const newCartList = cartList.map((product) => {
        if (product.id === productId) {
          return { ...product, quantity: product.quantity + 1 };
        }
        return product;
      });
      setCartList(newCartList);
      return;
    } else if (mode === "product") {
      const newProductQuantity = productQuantity.map((product) => {
        if (product.id === productId) {
          return { ...product, quantity: product.quantity + 1 };
        }
        return product;
      });
      setProductQuantity(newProductQuantity);
      return;
    }
  };

  const handleRemoveQuantity = (productId, mode) => {
    if (mode === "cart") {
      const newCartList = cartList.map((product) => {
        if (product.id === productId && product.quantity > 1) {
          return { ...product, quantity: product.quantity - 1 };
        }
        return product;
      });
      setCartList(newCartList);
      return;
    } else if (mode === "product") {
      const newProductQuantity = productQuantity.map((product) => {
        if (product.id === productId && product.quantity > 0) {
          return { ...product, quantity: product.quantity - 1 };
        }
        return product;
      });
      setProductQuantity(newProductQuantity);
      return;
    }
  };

  const handleAddToCart = (productId) => {
    const product = products.find((product) => product.id === productId);
    const pQuantity = productQuantity.find(
      (product) => product.id === productId
    );
    const newCartList = [...cartList];
    const productInCart = newCartList.find(
      (product) => product.id === productId
    );
    if (productInCart) {
      productInCart.quantity += pQuantity.quantity;
    } else if (pQuantity.quantity === 0) {
      alert(`Please select quantity for ${product.productName}`);
    } else {
      newCartList.push({ ...product, quantity: pQuantity.quantity });
    }
    setCartList(newCartList);
  };

  const handleRemoveFromCart = (productId) => {
    const newCartList = cartList.filter((product) => product.id !== productId);
    setCartList(newCartList);
  };

  const handleClearCart = () => {
    setCartList([]);
  };

  //handles delete product
  const handleOnDelete = async (id) => {
    try{
      const response = await axios.delete(`http://localhost:3000/product/${id}`);
      setPostResponse(response.data.message);
      console.log(response)
    }catch(error){
      console.log(error.message);
    }
  };

  //handles editing the product
  const handleOnEdit = async (id) => {
    try{
      const productToEdit = await axios.get(`http://localhost:3000/product/${id}`);
      console.log(productToEdit);
      setFormData({ 
        productName: productToEdit.data.productName,
        brand: productToEdit.data.brand,
        image: productToEdit.data.image,
        price: productToEdit.data.price,
        _id: productToEdit.data._id
      });
      setIsEditing(true);
    }catch(error){
      console.log(error.message);
    }
  };

  const handleResetForm = () => {
    setFormData({
      productName: "",
      brand: "",
      image: "",
      price: "",
    });
  };

  //Submit Form
  const handleOnSubmit = async (e) => {
    e.preventDefault(); //to prevent the page from refreshing
    try {
      if(isEditing){
        handleOnUpdate(formData._id);
        handleResetForm();
        setIsEditing(false);
      }else{
        await axios
        .post("http://localhost:3000/product", formData)
        .then((response) => setPostResponse(response.data.message))
        .then(()=> handleResetForm());
      }
      
    } catch (error) {
      console.log(error.message);
    }
  };

  //handles the update after editing
  const handleOnUpdate = async (id) => {
    try{
      const result = await axios.patch(`http://localhost:3000/product/${id}`, formData);
      setPostResponse(result.data.message);
    }catch(error){
      console.log(error.message);
    }
  };

  //change form hondle
  const handleOnChange = (e) => {
    setFormData((prevData) => {
      return { ...prevData, [e.target.name]: e.target.value };
    });
  };

  return (
    <div>
      <NavBar quantity={cartList.length} />
      <div className="GroceriesApp-Container">
        <div className="Form">
          <ProductForm
          productName={formData.productName}
          brand={formData.brand}
          image={formData.image}
          price={formData.price}
          handleOnSubmit={handleOnSubmit}
          handleOnChange={handleOnChange}
           isEditing={isEditing}
        />
        <p>{postResponse}</p>
        </div>
        <ProductsContainer
          products={product}
          handleAddQuantity={handleAddQuantity}
          handleRemoveQuantity={handleRemoveQuantity}
          handleAddToCart={handleAddToCart}
          productQuantity={productQuantity}
          handleOnDelete={handleOnDelete}
          handleOnEdit={handleOnEdit}
        />
        <CartContainer
          cartList={cartList}
          handleRemoveFromCart={handleRemoveFromCart}
          handleAddQuantity={handleAddQuantity}
          handleRemoveQuantity={handleRemoveQuantity}
          handleClearCart={handleClearCart}
        />
      </div>
    </div>
  );
}
