// Set active menu item and update heading
document.querySelectorAll('.menu-link').forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();

        // Remove active class from all links
        document.querySelectorAll('.menu-link').forEach((link) => {
            link.classList.remove('active');
        });

        // Add active class to clicked link
        link.classList.add('active');

        // Update the heading
        const headingText = link.querySelector('span').textContent;
        document.querySelector('.content-header h2').textContent = headingText;
    });
});
