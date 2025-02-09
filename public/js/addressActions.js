

// This function is responsible for handling address deletion
const deleteAddress = async (addressId) => {
    // Show a confirmation dialog using SweetAlert
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        background: '#fff', 
        color: '#000',
        showCancelButton: true,
        confirmButtonColor: '#000',
        cancelButtonColor: '#666',
        confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/profile/delete-address/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();  // Get error details from response
                console.error('Error deleting address:', errorData);
                throw new Error(errorData.message || 'Failed to delete address');
            }

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: result.message,
                    icon: 'success',
                    background: '#fff', 
                    color: '#000', 
                    confirmButtonColor: 'black', 
                    confirmButtonText: 'OK',
                }).then(() => {
                    window.location.href = '/profile/address';  // Redirect to the address page
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: result.message || 'Failed to delete address',
                    icon: 'error',
                    background: '#fff',
                    color: '#000',
                    confirmButtonColor: '#000',
                    confirmButtonText: 'Try again',
                });
            }
        } catch (error) {
            // Catch any errors that occur during the fetch process
            console.error("Error deleting address:", error);
            Swal.fire({
                title: 'Error',
                text: 'An unexpected error occurred',
                icon: 'error',
                background: '#fff',
                color: '#000',
                confirmButtonColor: '#000',
                confirmButtonText: 'OK',
            });
        }
    }
};
