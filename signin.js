document.addEventListener('DOMContentLoaded', function() {
  const signinForm = document.getElementById('signinForm');
  const loadingOverlay = document.getElementById('loadingOverlay');

  if (signinForm) {
    signinForm.addEventListener("submit", function(event) {
      event.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      // Validate inputs
      if (!username || !password) {
        showNotification("Please fill in all fields.", "error");
        return;
      }

      // Show loading
      if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
      }

      // Simulate loading delay for better UX
      setTimeout(() => {
        // Retrieve user data from localStorage
        const storedUser = localStorage.getItem(username);

        if (loadingOverlay) {
          loadingOverlay.style.display = 'none';
        }

        if (storedUser) {
          const user = JSON.parse(storedUser);

          if (user.password === password) {
            // Store current session
            sessionStorage.setItem('currentUser', JSON.stringify({
              username: user.username,
              fullName: user.fullName,
              grade: user.grade,
              loginTime: new Date().toISOString()
            }));

            showNotification(`Welcome back, ${user.fullName}!`, "success");
            
            // Redirect after short delay
            setTimeout(() => {
              window.location.href = "index.html";
            }, 1500);
          } else {
            showNotification("Incorrect password. Please try again.", "error");
            // Clear password field
            document.getElementById("password").value = '';
          }
        } else {
          showNotification("User not found. Please check your username or register first.", "error");
        }
      }, 1000);
    });
  }

  // Notification system
  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);

    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
  }

  // Check if user is already logged in
  const currentUser = sessionStorage.getItem('currentUser');
  if (currentUser) {
    const user = JSON.parse(currentUser);
    showNotification(`You're already signed in as ${user.fullName}`, "info");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  }
});
