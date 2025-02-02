function deleteProduct(productId) {
  Swal.fire({
    title: 'Are you sure?',
    text: "Do you really want to delete this item from your cart?",
    icon: 'warning',
  
    // Custom styles
    iconColor: '#D3B382',  // Match icon color with primary theme
    background: '#fffcf3', // Light background for a softer look
    color: 'hsl(0, 0%, 13%)',
  
    showCancelButton: true,
    confirmButtonColor: '#d7b178',
    cancelButtonColor: '#D3B382',
  
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  }).then((result) => {
      if (result.isConfirmed) {
        // If the user confirms, send the delete request to the server
        fetch('/cart/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }), // Send the productId to the server
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // Show a success message
              Swal.fire({
                title :'Deleted!',
                 text:'The item has been removed from your cart.', 
                 icon:  'success' ,
                background: '#fffcf3',
                confirmButtonColor: '#d7b178',
            });
             
              // Remove the product row from the UI
              removeProductFromUI(productId);
            } else {
              // Handle errors
              Swal.fire('Error!', data.error || 'Failed to delete the product.', 'error');
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            Swal.fire('Error!', 'Something went wrong. Please try again.', 'error');
          });
      }
    });
  }
  
  function removeProductFromUI(productId) {
    const productRow = document.querySelector(`[data-product-id="${productId}"]`).closest('tr');
    if (productRow) {
      productRow.remove();
    }
  }
  