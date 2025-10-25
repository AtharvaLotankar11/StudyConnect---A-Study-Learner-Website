document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  const successModal = document.getElementById('successModal');
  const closeModal = document.getElementById('closeModal');
  const continueBtn = document.getElementById('continueBtn');
  const userDetails = document.getElementById('userDetails');

  if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
      event.preventDefault();

      // Get form values
      const fullName = document.getElementById("fullname").value;
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const grade = document.getElementById("grade").value;

      // Validate fields
      if (!fullName || !username || !password || !grade) {
        showNotification("All fields are required!", "error");
        return;
      }

      // Check if username already exists
      if (localStorage.getItem(username)) {
        showNotification("Username already exists! Please choose another.", "error");
        return;
      }

      // Save user data
      const user = {
        fullName: fullName,
        username: username,
        password: password,
        grade: grade,
        registrationDate: new Date().toISOString()
      };

      localStorage.setItem(username, JSON.stringify(user));

      // Show success modal
      userDetails.innerHTML = `
        <div class="user-info">
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Grade/Year:</strong> ${grade}</p>
        </div>
      `;

      successModal.style.display = 'block';
      registerForm.reset();
    });
  }

  // Modal close handlers
  if (closeModal) {
    closeModal.addEventListener('click', function() {
      successModal.style.display = 'none';
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', function() {
      successModal.style.display = 'none';
      window.location.href = 'signin.html';
    });
  }

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === successModal) {
      successModal.style.display = 'none';
    }
  });

  // Notification system
  function showNotification(message, type = 'info') {
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
});
