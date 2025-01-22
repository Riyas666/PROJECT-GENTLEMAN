// // This function is responsible for handling address deletion
// const deleteAddress = async (addressId) => {
//     try {
//         // Sending a DELETE request to the server
//         const response = await fetch(`/profile/delete-address/${addressId}`, {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         });
        
//         if (!response.ok) {
//             const errorData = await response.json();  // Get error details from response
//             console.error('Error deleting address:', errorData);
//             throw new Error(errorData.message || 'Failed to delete address');
//         }
        

//         // Parse the JSON response
//         const data = await response.json();

//         // Check the response from the server
//         if (data.success) {
//             // If the deletion is successful, show a success message using SweetAlert
//             Swal.fire({
//                 icon: 'success',
//                 title: data.message || 'Address deleted successfully',
//                 showConfirmButton: false,
//                 timer: 1500,
//             });

           
//         } else {
//             // Show an error message using SweetAlert if the deletion failed
//             Swal.fire({
//                 icon: 'error',
//                 title: data.message || 'Failed to delete address',
//                 showConfirmButton: true,
//             });
//         }
//     } catch (error) {
//         // Catch any errors that occur during the fetch process
//         Swal.fire({
//             icon: 'error',
//             title: 'Unexpected error occurred',
//             showConfirmButton: true,
//         });
//         console.error("Error deleting address:", error);
//     }
// };






// This function is responsible for handling address deletion
const deleteAddress = async (addressId) => {
    // Show a confirmation dialog using SweetAlert
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
    });

    // If the user confirms the deletion
    if (result.isConfirmed) {
        try {
            // Sending a DELETE request to the server
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

            // Parse the JSON response
            const result = await response.json();

            // Check the response from the server
            if (result.success) {
                // If the deletion is successful, show a success message using SweetAlert
                Swal.fire({
                    title: 'Success!',
                    text: result.message,
                    icon: 'success',
                    button: 'OK',
                }).then(() => {
                    // Redirect the user to the address page after successful deletion
                    window.location.href = '/profile/address';  // Redirect to the address page
                });
            } else {
                // Show an error message using SweetAlert if the deletion failed
                Swal.fire({
                    title: 'Error',
                    text: result.message || 'Failed to delete address',
                    icon: 'error',
                    button: 'Try again',
                });
            }
        } catch (error) {
            // Catch any errors that occur during the fetch process
            console.error("Error deleting address:", error);
            Swal.fire({
                title: 'Error',
                text: 'An unexpected error occurred',
                icon: 'error',
                button: 'OK',
            });
        }
    }
};
