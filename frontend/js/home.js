$(document).ready(function () {
    // 1. Maintain a clean trailing slash format to match your project path configurations
    const url = 'http://localhost:5000/'; 

    const getCart = () => {
        let cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    };

    const saveCart = cart => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // 2. Fetch inventory items from your Express api mount
    $.ajax({
        method: "GET",
        url: `${url}api/v1/items`,
        dataType: 'json',
        success: function (data) {
            $("#items").empty();
            let row;
            $.each(data.rows, function (key, value) {
                // Dynamically build clean grids containing 4 columns per structural layout row
                if (key % 4 === 0) {
                    row = $('<div class="row"></div>');
                    $("#items").append(row);
                }
                
                // FIXED: Balanced out cross-origin trail mapping characters to load images smoothly
                var itemCard = `
                <div class="col-md-3 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${url}${value.img_path}" class="card-img-top" alt="${value.description}" style="height: 200px; object-fit: contain; padding: 10px;">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <div>
                                <h5 class="card-title text-truncate">${value.description}</h5>
                                <p class="card-text text-primary font-weight-bold">₱ ${parseFloat(value.sell_price).toFixed(2)}</p>
                            </div>
                            <div>
                                <p class="card-text">
                                    <small class="text-muted">Stock available: ${value.quantity ?? 0}</small> 
                                </p>
                                <button class="btn btn-block btn-outline-primary show-details" 
                                        data-id="${value.item_id}" 
                                        data-description="${value.description}" 
                                        data-price="${value.sell_price}" 
                                        data-image="${url}${value.img_path}" 
                                        data-stock="${value.quantity ?? 0}">
                                    View Options
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
                row.append(itemCard);
            });
        }
    });

    // 3. Click Event Delegate: Mount details straight onto your bootstrap layout fields
    $('#items').on('click', '.show-details', function () {
        const id = $(this).data('id');
        const description = $(this).data('description');
        const price = $(this).data('price');
        const image = $(this).data('image');
        const stock = $(this).data('stock');

        $('#productDetailsModalLabel').text(description);
        
        const modalBody = `
            <div class="text-center mb-3">
                <img src="${image}" class="img-fluid" style="max-height: 250px; object-fit: contain;">
            </div>
            <h4>Price: <span class="text-success">₱ ${parseFloat(price).toFixed(2)}</span></h4>
            <p class="text-muted">Available Stock level: <strong>${stock}</strong></p>
            <input type="hidden" id="detailsItemId" value="${id}">
            <input type="hidden" id="detailsItemPrice" value="${price}">
            <div class="form-group row mt-3">
                <label for="detailsQty" class="col-sm-4 col-form-label font-weight-bold">Quantity:</label>
                <div class="col-sm-8">
                    <input type="number" id="detailsQty" class="form-control" value="1" min="1" max="${stock}">
                </div>
            </div>`;
            
        $('#productDetailsModalBody').html(modalBody);
        $('#productDetailsModal').modal('show');
    });

    // 4. Staging transaction calculations internally inside local storage arrays
    $(document).on('click', '#confirmAddToCart', function () {
        const qty = parseInt($("#detailsQty").val());
        const stock = parseInt($("#productDetailsModalBody strong").text());
        
        if (qty > stock) {
            return Swal.fire({ icon: 'error', text: 'Selected volume exceeds available stock parameters.' });
        }

        const id = parseInt($("#detailsItemId").val());
        const description = $("#productDetailsModalLabel").text();
        const price = parseFloat($("#detailsItemPrice").val());
        const image = $("#productDetailsModalBody img").attr('src');
        
        let cart = getCart();
        let existing = cart.find(item => item.item_id == id);

        if (existing) {
            if (existing.quantity + qty > stock) {
                return Swal.fire({ icon: 'error', text: 'Total cart aggregation breaks stock capabilities.' });
            }
            existing.quantity += qty;
        } else {
            cart.push({
                item_id: id,
                description: description,
                price: price,
                image: image,
                quantity: qty
            });
        }
        
        saveCart(cart);
        $('#itemCount').text(cart.length).show();
        $('#productDetailsModal').modal('hide');
        Swal.fire({ icon: 'success', text: 'Item staged in cart allocation receipt!', timer: 1000, showConfirmButton: false });
    });

    // FIXED: Remounted the async loader to target your precise base wrapper division id
    $("#home").load("header.html", function() {
        let cart = getCart();
        let totalItems = cart.length;
        
        if (totalItems > 0) {
            $('#itemCount').text(totalItems).show();
        } else {
            $('#itemCount').hide();
        }
    });
});