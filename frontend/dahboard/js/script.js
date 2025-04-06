// Add JavaScript for interactivity later if needed.
// For now, it can remain empty or contain basic setup.

document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard loaded");

    // Example: Add active class handling for sidebar (optional, CSS handles initial state)
    const navLinks = document.querySelectorAll('.sidebar-nav li a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Prevent default link behavior for now
            event.preventDefault();

            // Remove active class from all parent 'li' elements
            navLinks.forEach(l => l.parentElement.classList.remove('active'));

            // Add active class to the clicked link's parent 'li'
            this.parentElement.classList.add('active');

            // You would typically navigate or update content here
            console.log("Navigating to:", this.textContent.trim());
        });
    });

});