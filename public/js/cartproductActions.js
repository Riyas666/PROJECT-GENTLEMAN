function deleteProduct(productId) {
    // Show a SweetAlert2 confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this item from your cart?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
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
              Swal.fire('Deleted!', 'The item has been removed from your cart.', 'success');
  
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
  