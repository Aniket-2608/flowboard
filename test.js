// function greet(name, callback) {
//   console.log("Hello " + name);
//   callback();
// }

// greet("Aniket", () => {
//   console.log("Callback executed");
// });

const cart = ["Shoes", "Pants", "Kurtas"];

// createOrder(cart, function(orderId){
//     proceedToPayment(orderId);
// })

const promise = createOrder(cart);


console.log(promise, "Promise");

function createOrder(item){
    return (item[0])
}

