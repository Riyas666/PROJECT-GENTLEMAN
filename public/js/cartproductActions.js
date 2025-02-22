function deleteProduct(productId, size) {  // Accept size as a parameter
  Swal.fire({
    title: 'Are you sure?',
    text: "Do you really want to delete this item from your cart?",
    icon: 'warning',
    background: '#fff',
    color: '#000',
    showCancelButton: true,
    confirmButtonColor: '#000',
    cancelButtonColor: '#666',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      // Send the delete request with productId and size
      fetch('/cart/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size }),  // Include size
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Show a success message
            Swal.fire({
              title: 'Deleted!',
              text: 'The item has been removed from your cart.',
              icon: 'success',
              background: '#fff',
              color: '#000',
              confirmButtonColor: 'black',
            });

            removeProductFromUI(productId, size); // Pass size to remove function
          } else {
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

function removeProductFromUI(productId, size) {
  const productRow = document.querySelector(`[data-product-id="${productId}"][data-size="${size}"]`).closest('tr');
  if (productRow) {
    productRow.remove();
  }
}

  