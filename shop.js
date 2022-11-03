//DOM Variable Setting
const productsDOM = document.querySelector('.productPlacement'); // th area where the books are displayed
const searchBar = document.querySelector('.bookBox'); // the search bar
const cartOverlay = document.querySelector('.cartPanel'); // an area rpresenting the cart
const cartBtn = document.querySelector('.cartButton'); // a button to show thee cart
const cartItems = document.querySelector('.cartItems'); //number of cart items
const closeCartBtn = document.querySelector('.closeCart'); // a button to close the cart panl
const clearCartBtn = document.querySelector('.clearCart'); // a button to clear the contents of th cart
const placeOrderBtn = document.querySelector('.placeOrder'); // a button to placee an order (non-functional at the moment)
const cartContents = document.querySelector('.cartContents'); // a list of hte contents of the cart
const totalPrice = document.querySelector('.cartTotal'); // total price of iteems in the cart
const randomItem = document.querySelector('.randomIcon'); // a button to display a random item not in the cart

let cart = [];

class Products{
    async getProducts(){
        try {
            let result = await fetch('products.json');
  
            let data = await result.json();
            
            let products = data.items;
           
            products = products.map(item =>{
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image =item.fields.image.fields.file.url;
                const desc = getDescription(item.sys.id);
                return {title, price, id, image, desc};
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

class UI{
   displayMain(){
        document.getElementById("area").style.maxWidth = '1170px';
       let products = JSON.parse(localStorage.getItem('products'));
       products.forEach(item =>{
           const article = document.createElement('article'); 
           article.classList.add('product');   
           article.innerHTML = `
           <div class="imgContainer">
           <img src=${item.image} alt="" class="bookImg" height=400>
           <button class="addToCart" data-id=${item.id}>
               <i class="fas fa-shopping-cart"></i>
               Add to Cart
           </button>
           <p class = "shortDescription">${item.desc}</p>
           </div>
           <h3>${item.title}</h3>
           <h4>$${item.price}</h4>`;
           productsDOM.appendChild(article);
       });
   }

  displayARandomItem(randomId){
      while(productsDOM.firstChild){
        productsDOM.removeChild(productsDOM.firstChild);
      }
      let products = JSON.parse(localStorage.getItem('products'));
      products.forEach(item=>{
        if(item.id == randomId){
            const article = document.createElement('article'); 
            article.classList.add('product');   
            article.innerHTML = `
            <div class="imgContainer">
            <img src=${item.image} alt="" class="bookImg" height=400>
            <button class="addToCart" data-id=${item.id}>
                <i class="fas fa-shopping-cart"></i>
                Add to Cart
            </button>
            <p class = "shortDescription">${item.desc}</p>
            </div>
            <h3>${item.title}</h3>
            <h4>$${item.price}</h4>`;
            productsDOM.appendChild(article);
            return;      
        }
      })
    }
   
   displayPriceLessEqual(maxPrice){
        document.getElementById("area").style.maxWidth = '1170px';
        while(productsDOM.firstChild){
          productsDOM.removeChild(productsDOM.firstChild);
        }
        let products = JSON.parse(localStorage.getItem('products'));
        products.forEach(item =>{
          if(parseFloat(item.price) <= parseFloat(maxPrice)){
            const article = document.createElement('article'); 
            article.classList.add('product');   
            article.innerHTML = `
            <div class="imgContainer">
            <img src=${item.image} alt="" class="bookImg" height=400>
            <button class="addToCart" data-id=${item.id}>
                <i class="fas fa-shopping-cart"></i>
                Add to Cart
            </button>
            <p class = "shortDescription">${item.desc}</p>
            </div>
            <h3>${item.title}</h3>
            <h4>$${item.price}</h4>`;
            productsDOM.appendChild(article);
          }
        })
   }
   
   

   showCart(){
    cartOverlay.classList.add('somethingSomething');
  }

  hideCart(){
    cartOverlay.classList.remove('somethingSomething');
  }

  getCartButtons(){
    const btns = document.querySelectorAll('.addToCart');
    btns.forEach(element =>{  
       let id = element.dataset.id;
       let inCart = cart.find(item => item.id ===id);
       if(inCart){
         element.innerText ="In Cart";
         element.disabled = true;
       }
       element.addEventListener('click', (event)=>{
         event.target.innerText = "In Cart";
         event.target.disabled = true;
         let cartItem = {...Storage.getProduct(id), amount: 1};   
         cart = [...cart, cartItem]; //...cart means everything we had in cart
         Storage.saveCart(cart);
         this.setCartValues(cart);
         this.addCartItem(cartItem)
       })
    })
  }

  addCartItem(item){
    const div = document.createElement('div');
    div.classList.add('cartItem');
    div.innerHTML = `
                   <img src=${item.image}>
                   <div>
                   <h4>${item.title}</h4>
                   <h5>$${item.price}</h5> 
                   <span class="removeItem" data-id =${item.id}>remove</span>
                   </div>
                   <div>
                   <i class="fas fa-chevron-up" data-id =${item.id}></i>
                   <p class="item-amount">${item.amount}</p>
                   <i class="fas fa-chevron-down" data-id =${item.id}></i>
                   </div>
    `;
    cartContents.appendChild(div);
  }

  setCartValues(cart){
    let tempTotal = 0;
    let itemsTotal =0;
    cart.forEach(item =>{
      tempTotal += item.price* item.amount;
      itemsTotal += item.amount;
    })
    totalPrice.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  prepareCartLogic(){
    const btns = document.querySelectorAll('.addToCart');
    clearCartBtn.addEventListener('click', ()=>{
      cart =[];
      Storage.saveCart(cart);
      this.setCartValues(cart);
      btns.forEach(element =>{
        element.innerHTML = `<i class="fas fa-shopping-cart"></i>
              Add to Cart`;
        element.disabled = false;
      });
      while(cartContents.children.length > 0){
        cartContents.removeChild(cartContents.children[0]);
      }
    });
    cartContents.addEventListener('click', (event)=>{
      if(event.target.classList.contains('removeItem')){
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        this.removeItem(id);
        cartContents.removeChild(removeItem.parentElement.parentElement);
      }
      if(event.target.classList.contains('fa-chevron-up')){
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount ++;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }

      if(event.target.classList.contains('fa-chevron-down')){
        let subAmount = event.target;
        let id = subAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount --;
        if(tempItem.amount > 0){
         Storage.saveCart(cart);
          this.setCartValues(cart);
          subAmount.previousElementSibling.innerText = tempItem.amount;
        }else{
          cartContents.removeChild(subAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  removeItem(id){
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleBtn(id);
    button.disabled = false;
    button.innerHTML =`<i class="fas fa-shopping-cart"></i>
              Add to Cart`;
  }

  getSingleBtn(id){
    const btns = document.querySelectorAll('.addToCart');
    let button;
    btns.forEach(element =>{
      if(element.dataset.id === id){
        button = element;
      }
    });
    return button;
  }

  setupApp(){
    cart = Storage.getCart();
    this.setCartValues(cart);
    cart.forEach(item => this.addCartItem(item));
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
    randomItem.addEventListener('click', (e)=>{
      let randId = Math.floor(Math.random() * 20) + 1;
      this.displayARandomItem(randId);
      document.getElementById("area").style.maxWidth = '300px';
      this.getCartButtons();
    });
  }
}


class Storage{ 
    static saveProducts(products){
      //JSON.stringify() method converts a JavaScript object or value to a JSON string
      //the key is "products"
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id){ 
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find( product=> product.id === id);
    }

    static saveCart(cart){
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart(){
      return localStorage.getItem('cart')? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", ()=>{ //everything starts here
    const ui = new UI();
    const products = new Products();

    products.getProducts().then(products => Storage.saveProducts(products)); 

    ui.displayMain();
    ui.setupApp();
    ui.prepareCartLogic();
    ui.getCartButtons();
    ////////////////////////////////////////////////

    searchBar.addEventListener('keyup', (e)=>{
      if(e.keyCode === 13)
      {
          let maxPrice = e.target.value;
          ui.displayPriceLessEqual(maxPrice);
          ui.getCartButtons();
      }
    });
})



// Gets a description for a book
// Descriptions added here because in original assignment we were not allowed to modify JSON file
// Will most likely change this as this is seperate from project
function getDescription(id){
  switch(id){
    case "1":
      return "The first book in the Fablehaven series.";
    case "2":
      return "The second book in the Fablehaven series.";
    case "3":
      return "The third book in the Fablehaven series.";
    case "4":
      return "The fourth book in the Fablehaven series.";
    case "5":
      return "The fifth book in the Fablehaven series.";
    case "6":
      return "An introductory book to Python.";
    case "7":
      return "An epic fantasy novel and the first book of The Stormlight Archives."; 
    case "8":
      return "Get your party in the adventuring mood with these fantasy dishes!"; 
    case "9":
      return "Learn how to play and make characters for Dungeons and Dragons."; 
    case "10":
      return "Everything a Dungeon Master needs to create thrilling adventures."; 
    case "11":
      return "A menagerie of monsters for a DM to test their players with."; 
    case "12":
      return "The first book in the epic fantasy series The Sword of Truth."; 
    case "13":
      return "Learn how write cleaner code with this guide to Agile programming!"; 
    case "14":
      return "The first book of the Monster Hunter book series (NOT related to video game of same name)."; 
    case "15":
      return "The second book of the Monster Hunter book series"; 
    case "16":
      return "The third book of the Monster Hunter book series"; 
    case "17":
      return "The fourth book of the Monster Hunter book series"; 
    case "18":
      return "The first book of an epic graphic novel series"; 
    case "19":
      return "Learn how to use Javascript and JQuery for effective front-end web development."; 
    case "20":
      return "Filled with maps, random encounter tables, and plot hooks for DMs to use."; 
    default: // Used for debugging/testing  mainly
      return "Testing...";
  }
}

