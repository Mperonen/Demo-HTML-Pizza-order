/*
    PIZZA PRICE CALCULATOR
    by Mikko-Pentti Einari Eronen
    2025-03-27
*/




// CATALOG: for pizza sizes.
const catalog_sizes = [[8.0, 'Normal'], [12.0, 'Family'], [15.0, 'Max']];

// CATAOG: for pizza fillings.
const catalog_toppings = [[0.5, 'Ham'], [0.85, 'Bacon'], [0.5, 'Pineapple'], [0.5, 'Tuna'], [0.4, 'Champignon'], [0.5, 'Olive'], [0.5, 'Extra cheese']];


// Generates input rows based on a given catalog.
function create_input_rows(catalog, container, is_radio = false, group_name = "group") {

    for (let index = 0; index < catalog.length; index++) {
        let id_name = catalog[index][1].replace(" ", "-");

        let row = document.createElement("div");
        row.className = "fieldset-input-row";

        let input_elem = document.createElement("input");
        input_elem.id = id_name;
        input_elem.value = index;
        input_elem.name = group_name;

        if (is_radio) {
            input_elem.type = "radio";
        } else {
            input_elem.type = "checkbox";
        }

        let label = document.createElement("label");
        label.setAttribute("for", id_name);
        label.innerHTML = catalog[index][1] + ` (${catalog[index][0]} €)`;

        row.appendChild(input_elem);
        row.appendChild(label);
        container.appendChild(row);
    }

}

// Clears selection for a given group.
function clear_group(group) {
    for (let i of group) {
        i.checked = false;
    }
}



// Calculates a total pizza price.
function calculate_pizza_price() {
    let pizza_price = 0;

    let sizes = document.querySelectorAll('input[name="pizza-sizes"]:checked');
    for (let i of sizes) {
        pizza_price += catalog_sizes[i.value][0];
    }

    let fillings = document.querySelectorAll('input[name="pizza-fillings"]:checked');
    for (let i of fillings) {
        pizza_price += catalog_toppings[i.value][0];
    }

    return pizza_price;
}

// If no size is selected, fillings are disabled.
function update_fillings_state() {
    let sizes = document.querySelectorAll('input[name="pizza-sizes"]:checked');
    if (sizes.length < 1) {
        document.querySelector('#catalog-fillings').disabled = true;
    }
    else {
        document.querySelector('#catalog-fillings').disabled = false;
    }
}

// Calculate price of pizza.
function update_pizza_price() {
    update_fillings_state();

    let price = calculate_pizza_price();
    let ui_price = price;
    display_pizza_ui_price(ui_price);
}


// Parses a float price value into a formatted string
function price_string(float_price) {
    return float_price.toFixed(2).toString().replace(".", ",") + " €";
}

// Displays the pizza's total price.
function display_pizza_ui_price(pizza_price) {
    document.querySelector('#current-pizza-price').innerHTML = "Pizza: " + price_string(pizza_price);
}


// Clears the inputs for the current pizza.
function clear_pizza() {
    // Sizes
    clear_group(document.querySelectorAll('input[name="pizza-sizes"]'));
    // Fillings
    clear_group(document.querySelectorAll('input[name="pizza-fillings"]'));
}


// Calculate total order price.
function total_order_price() {
    let rows = document.querySelector('#added-pizzas').children;

    let total_price = 0.0;
    for (let row of rows) {
        let price =  parseFloat(row.getAttribute("price"));
        total_price += price;
    }

    total_price = total_price.toFixed(2).toString();

    document.querySelector('#total-order-price').innerHTML = total_price + " €";
}

// Creates a topping list item for added pizza.
function create_list_item(list_container, catalog, item) {
    let li_incredient = document.createElement('li');
    li_incredient.innerHTML = catalog[item.value][1] + " " + catalog[item.value][0] + " €";
    list_container.appendChild(li_incredient);
}


// Creates a row for added pizza.
function add_pizza_to_order() {

    let pizza_price = calculate_pizza_price();

    if (pizza_price <= 0.0) {
        return;
    }

    let row = document.createElement('div');
    row.className = 'order-row';
    row.setAttribute("price", pizza_price);
    
    // List of selected incredients.
    ul_incredients = document.createElement('ul');
    let sizes = document.querySelectorAll('input[name="pizza-sizes"]:checked');
    for (let i of sizes) {
        create_list_item(ul_incredients, catalog_sizes, i);
    }

    let fillings = document.querySelectorAll('input[name="pizza-fillings"]:checked');
    for (let i of fillings) {
        create_list_item(ul_incredients, catalog_toppings, i);
    }

    row.appendChild(ul_incredients);

    // Pizza's price.
    let ui_pizza_price = document.createElement('p');
    ui_pizza_price.className = "order-row-price";
    ui_pizza_price.innerHTML = price_string(pizza_price);
    row.appendChild(ui_pizza_price);

    // Button for row removal.
    let btn_remove_pizza = document.createElement('button');
    btn_remove_pizza.innerHTML = "-";
    btn_remove_pizza.onclick = remove_pizza_from_orders;
    row.appendChild(btn_remove_pizza);

    document.querySelector('#added-pizzas').appendChild(row);
    clear_pizza();
    total_order_price();
    save_to_storage();
}

// Removes a pizza from the orders.
function remove_pizza_from_orders(e) {
    e.target.parentNode.remove();
    total_order_price();
    save_to_storage();
}


// Check browser support for storage.
function storage_supported() {
    if (typeof(Storage) !== "undefined") {
      return true;
    } else {
      return false;
    }
}


// Save current order into HTML5storage.
function save_to_storage() {
    if (!storage_supported()) {
        return false;
    }

    let order_dom_str = document.querySelector('#added-pizzas').innerHTML;
    localStorage.setItem("order", order_dom_str);
}


// Loads order from HTML5-storage.
function load_from_storage() {
    if (!storage_supported()) {
        return false;
    }

    // Uses innerHTML string to store and load the content.
    let container = document.querySelector('#added-pizzas');
    container.innerHTML = localStorage.getItem("order");

    // Adds remove event to buttons.
    let buttons = container.querySelectorAll("button");
    for (btn of buttons) {
        btn.onclick = remove_pizza_from_orders;
    }

    total_order_price();
}

window.onload = function() {

    create_input_rows(catalog_sizes, document.querySelector('#catalog-sizes'), true, 'pizza-sizes');
    create_input_rows(catalog_toppings, document.querySelector('#catalog-fillings'), false, 'pizza-fillings');

    document.querySelector('#order').onclick = update_pizza_price;
    document.querySelector('#btn-add-pizza').onclick = add_pizza_to_order;
    document.querySelector('#btn-clear-pizza').onclick = clear_pizza;

    update_fillings_state();
    update_pizza_price();
    load_from_storage();
}