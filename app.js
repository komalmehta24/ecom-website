// declaring variables
//cartBtn = Selects the button that opens the shopping cart.
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems= document.querySelector('.cart-items');
const cartTotal= document.querySelector('.cart-total');
const cartContent= document.querySelector('.cart-content');
//productDOM = Selects the container where products will be displayed.
const productDOM= document.querySelector('.products-center');
const btns = document.querySelectorAll(".bag-btn");


//Declaring Arrays = cart and buttons
let cart =[];
let buttonsDOM = [];


//class is responsible for getting the products
class Products{   
    //declaration of class
    async getProducts(){ 
        // asyc means function is asynchronous to use await function in it 
        // purpose is to fetch product data from file named products.json
        
       try {
            
        let result= await fetch('products.json') 
            //fetch() =sends request to get the file named products.json
            // await = makes JS wait untill fetch request is completed and response is stored in result variable
            
            let data = await result.json();
            // extract the JSON data from response and wait untill JSON is fully parsed then store it in data 
            
            let products = data.items;
            //JSON has an items property containing an array of products.
            products =products.map(item =>{
            // transform each items inside the array
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })

            return products
            //return products
        
        }   catch (error) {
            //if error occurs print error message
            console.log(error);
        }
      
     
    }
}

//resposible for display the products 
//Loops through the products array. and Creates an HTML structure for each product. and Inserts the generated HTML into .products-center.
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product =>{
            result += `<!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img 
                    src= ${product.image} 
                    alt="product" 
                    class="product-img"/>
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>Rs ${product.price}</h4>
            </article>
            <!-- end of single product -->`;
        });
        productDOM.innerHTML = result;
    }
    getBagButtons(){
        const buttons =[...document.querySelectorAll(".bag-btn")];
        buttonsDOM =buttons;
        buttons.forEach(button =>{
            let id = button.dataset.id;
            let inCart =cart.find(item => item.id == id);
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true;
            }
                button.addEventListener('click',(event)=>{
                    event.target.innerText = "In Cart";
                    event.target.disabled = true;
                    //get product from products
                    let cartItem = {...Storage.getProduct(id),
                        amount:1}; 
                    
                    //add product to cart
                    cart = [...cart,cartItem];

                    //save cart in the local storage 
                    Storage.saveCart(cart)
                    //set values of cart
                    this.setCartValues(cart);
                    //display cart items
                    this.addCartItem(cartItem);
                    //show the cart
                    this.showCart();
                });

        });
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;

    };
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src= ${iyem.image} alt="product" />
                    <div>
                        <h4>${item.title}</h4>
                        <h5>Rs ${item.price}</h5>
                        <span class="remove-item" data-id= ${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id= ${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down"data-id= ${item.id}></i>
                    </div>`;
                    cartContent.appendChild(div);
    } 
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener.add('click',this.showCart);
        closeCartBtn.addEventListener('click',this.hideCart);
    }
    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));
        
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic(){
        clearCartBtn.addEventListener('click',() =>{
            this.clearCart();
        });
        //cart functionality
        cartContent.addEventListener('click',event =>{
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if (event.target.classList.contains
            ("fa-chevron-up")){
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id ===id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
        }
        else if (event.target.classList.contains
        ("fa-chevron-down")){
            let lowerAmount = event.target;
            let id = lowerAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id );
            tempItem.amount = tempItem.amount-1;
            if(tempItem.amount >0){
                Storage.saveCart(cart);
                this.setCartValues(cart);
                lowerAmount.previousElementSibling.innerText = tempItem.amount; 
            }
            else{
                cartContent.removeChild(lowerAmount.parentElement.parentElement);
                this.removeItem(id);
            }

            }
        });
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id)); 
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false ;
        button.innerHTML = ` <i class="fas fa-shopping-cart"></i>add to cart`;
    }
    getSingleButton(){
        return buttonsDOM.find(button => button.dataset.id === id);
    }

}

//local storage class 
class Storage{
    //Converts the products array into a JSON string using JSON.stringify().
    //Stores the string in local storage under the key "products".
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }

    //Retrieves the "products" data from local storage.
    //Converts the stored string back into a JavaScript object using JSON.parse()
    //Searches for a product in the array with the matching id using .find().
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id == id );
    }

    //Stores the cart in local storage under the key "cart" after converting it into string
    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}

// event listener where we kick things
document.addEventListener("DOMContentLoaded",() =>{
    //Manages user interface interactions.
    const ui = new UI();
    //Fetches product data.
    const products = new Products();

    //setup applications
    ui.setupAPP();

    //Calls getProducts() (which fetches products.json).
    products.getProducts().then(products => {
        //Displays the products on the webpage via ui.displayProducts(products).
        ui.displayProducts(products);
        //Saves the products in local storage with Storage.saveProducts(products).
        Storage.saveProducts(products);
        }).then(()=>{
            //method activates the "Add to Cart" buttons by 
            // Checking if the product is already in the cart. and 
            // Attaching click event listeners to the buttons
            ui.getBagButtons();
        });
    });
