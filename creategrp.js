document.addEventListener('DOMContentLoaded', function() {
  const createForm = document.getElementById('createForm');
  const successModal = document.getElementById('successModal');
  const closeModal = document.getElementById('closeModal');
  const createAnotherBtn = document.getElementById('createAnotherBtn');
  const viewGroupsBtn = document.getElementById('viewGroupsBtn');
  const groupDetails = document.getElementById('groupDetails');

  // Set minimum date to today
  const meetingTimeInput = document.getElementById('meetingtime');
  if (meetingTimeInput) {
    const now = new Date();
    const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    meetingTimeInput.min = minDateTime;
  }

  if (createForm) {
    createForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Get form values
      const groupName = document.getElementById('groupname').value.trim();
      const course = document.getElementById('course').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const level = document.getElementById('level').value;
      const description = document.getElementById('description').value.trim();
      const meetingTime = document.getElementById('meetingtime').value;
      const frequency = document.getElementById('frequency').value;
      const maxMembers = document.getElementById('maxMembers').value;
      const location = document.getElementById('location').value.trim();

      // Validate required fields
      if (!groupName || !course || !subject || !level || !description || !meetingTime || !frequency || !maxMembers || !location) {
        showNotification('Please fill in all required fields.', 'error');
        return;
      }

      // Check if group name already exists
      const existingGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
      if (existingGroups.some(group => group.groupName.toLowerCase() === groupName.toLowerCase())) {
        showNotification('A group with this name already exists. Please choose a different name.', 'error');
        return;
      }

      // Get current user
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
      if (!currentUser) {
        showNotification('Please sign in to create a group.', 'error');
        setTimeout(() => {
          window.location.href = 'signin.html';
        }, 2000);
        return;
      }

      // Create new group object
      const newGroup = {
        id: Date.now().toString(),
        groupName,
        course,
        subject,
        level,
        description,
        meetingTime,
        frequency,
        maxMembers: parseInt(maxMembers),
        location,
        creator: currentUser.username,
        creatorName: currentUser.fullName,
        members: [currentUser.username],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      // Add to existing groups
      existingGroups.push(newGroup);
      localStorage.setItem('studyGroups', JSON.stringify(existingGroups));

      // Show success modal
      const meetingDate = new Date(meetingTime);
      groupDetails.innerHTML = `
        <div class="group-info">
          <h4>${groupName}</h4>
          <p><strong>Course:</strong> ${course}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Level:</strong> ${level}</p>
          <p><strong>First Meeting:</strong> ${meetingDate.toLocaleDateString()} at ${meetingDate.toLocaleTimeString()}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Max Members:</strong> ${maxMembers}</p>
        </div>
      `;

      successModal.style.display = 'block';
      createForm.reset();
      
      // Reset minimum date
      if (meetingTimeInput) {
        const now = new Date();
        const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        meetingTimeInput.min = minDateTime;
      }
    });
  }

  // Modal event handlers
  if (closeModal) {
    closeModal.addEventListener('click', function() {
      successModal.style.display = 'none';
    });
  }

  if (createAnotherBtn) {
    createAnotherBtn.addEventListener('click', function() {
      successModal.style.display = 'none';
    });
  }

  if (viewGroupsBtn) {
    viewGroupsBtn.addEventListener('click', function() {
      successModal.style.display = 'none';
      window.location.href = 'findgrp.html';
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

  // Form validation helpers
  const inputs = createForm?.querySelectorAll('input[required], select[required], textarea[required]');
  inputs?.forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearError);
  });

  function validateField(e) {
    const field = e.target;
    if (!field.value.trim()) {
      field.style.borderColor = 'var(--error-color)';
    } else {
      field.style.borderColor = 'var(--border-color)';
    }
  }

  function clearError(e) {
    const field = e.target;
    field.style.borderColor = 'var(--border-color)';
  }
});
