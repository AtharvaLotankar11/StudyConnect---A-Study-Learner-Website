document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('searchForm');
  const clearBtn = document.getElementById('clearBtn');
  const resultsGrid = document.getElementById('resultsGrid');
  const resultsTitle = document.getElementById('resultsTitle');
  const resultsCount = document.getElementById('resultsCount');
  const noResults = document.getElementById('noResults');
  
  // Modal elements
  const joinModal = document.getElementById('joinModal');
  const detailsModal = document.getElementById('detailsModal');
  const closeJoinModal = document.getElementById('closeJoinModal');
  const closeDetailsModal = document.getElementById('closeDetailsModal');
  const cancelJoinBtn = document.getElementById('cancelJoinBtn');
  const confirmJoinBtn = document.getElementById('confirmJoinBtn');
  const closeDetailsBtn = document.getElementById('closeDetailsBtn');
  const joinFromDetailsBtn = document.getElementById('joinFromDetailsBtn');
  
  let currentGroup = null;
  let allGroups = [];

  // Load and display all groups on page load
  loadGroups();

  // Search form handler
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      performSearch();
    });
  }

  // Clear button handler
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      searchForm.reset();
      loadGroups();
      resultsTitle.textContent = 'All Study Groups';
    });
  }

  // Modal event handlers
  if (closeJoinModal) {
    closeJoinModal.addEventListener('click', () => joinModal.style.display = 'none');
  }
  
  if (closeDetailsModal) {
    closeDetailsModal.addEventListener('click', () => detailsModal.style.display = 'none');
  }
  
  if (cancelJoinBtn) {
    cancelJoinBtn.addEventListener('click', () => joinModal.style.display = 'none');
  }
  
  if (closeDetailsBtn) {
    closeDetailsBtn.addEventListener('click', () => detailsModal.style.display = 'none');
  }

  if (confirmJoinBtn) {
    confirmJoinBtn.addEventListener('click', joinGroup);
  }

  if (joinFromDetailsBtn) {
    joinFromDetailsBtn.addEventListener('click', () => {
      detailsModal.style.display = 'none';
      showJoinModal(currentGroup);
    });
  }

  // Close modals when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === joinModal) {
      joinModal.style.display = 'none';
    }
    if (event.target === detailsModal) {
      detailsModal.style.display = 'none';
    }
  });

  function loadGroups() {
    allGroups = JSON.parse(localStorage.getItem('studyGroups')) || [];
    displayGroups(allGroups);
  }

  function performSearch() {
    const course = document.getElementById('course').value.toLowerCase().trim();
    const subject = document.getElementById('subject').value.toLowerCase().trim();
    const level = document.getElementById('level').value;
    const location = document.getElementById('location').value.toLowerCase().trim();
    const frequency = document.getElementById('frequency').value;

    let filteredGroups = allGroups.filter(group => {
      const matchesCourse = !course || group.course.toLowerCase().includes(course);
      const matchesSubject = !subject || group.subject.toLowerCase().includes(subject);
      const matchesLevel = !level || group.level === level;
      const matchesLocation = !location || group.location.toLowerCase().includes(location);
      const matchesFrequency = !frequency || group.frequency === frequency;

      return matchesCourse && matchesSubject && matchesLevel && matchesLocation && matchesFrequency;
    });

    displayGroups(filteredGroups);
    resultsTitle.textContent = 'Search Results';
  }

  function displayGroups(groups) {
    resultsGrid.innerHTML = '';
    
    if (groups.length === 0) {
      noResults.style.display = 'block';
      resultsCount.textContent = '';
      return;
    }

    noResults.style.display = 'none';
    resultsCount.textContent = `${groups.length} group${groups.length !== 1 ? 's' : ''} found`;

    groups.forEach(group => {
      const groupCard = createGroupCard(group);
      resultsGrid.appendChild(groupCard);
    });
  }

  function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card';

    const meetingDate = new Date(group.meetingTime);
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const isCreator = currentUser && currentUser.username === group.creator;
    const isMember = currentUser && group.members.includes(currentUser.username);
    const isFull = group.members.length >= group.maxMembers;

    card.innerHTML = `
      <div class="group-header">
        <div>
          <h3 class="group-title">${group.groupName}</h3>
          <span class="group-level level-${group.level}">${group.level}</span>
        </div>
      </div>
      
      <div class="group-meta">
        <div class="meta-item">
          <i class="fas fa-book"></i>
          <span>${group.course} - ${group.subject}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-calendar"></i>
          <span>${meetingDate.toLocaleDateString()} at ${meetingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>${group.location}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-clock"></i>
          <span>${group.frequency}</span>
        </div>
      </div>
      
      <p class="group-description">${group.description}</p>
      
      <div class="group-footer">
        <div class="group-members">
          <i class="fas fa-users"></i>
          <span>${group.members.length}/${group.maxMembers} members</span>
        </div>
        <div class="group-actions">
          <button class="btn btn-outline btn-sm" onclick="showGroupDetails('${group.id}')">
            <i class="fas fa-info"></i> Details
          </button>
          ${getJoinButton(group, isCreator, isMember, isFull)}
        </div>
      </div>
    `;

    return card;
  }

  function getJoinButton(group, isCreator, isMember, isFull) {
    if (isCreator) {
      return '<span class="btn btn-secondary btn-sm" style="cursor: default;"><i class="fas fa-crown"></i> Creator</span>';
    } else if (isMember) {
      return '<span class="btn btn-success btn-sm" style="cursor: default;"><i class="fas fa-check"></i> Joined</span>';
    } else if (isFull) {
      return '<span class="btn btn-secondary btn-sm" style="cursor: default;"><i class="fas fa-lock"></i> Full</span>';
    } else {
      return `<button class="btn btn-primary btn-sm" onclick="showJoinModal('${group.id}')"><i class="fas fa-plus"></i> Join</button>`;
    }
  }

  // Global functions for button clicks
  window.showGroupDetails = function(groupId) {
    const group = allGroups.find(g => g.id === groupId);
    if (!group) return;

    currentGroup = group;
    const meetingDate = new Date(group.meetingTime);
    
    document.getElementById('groupDetailsContent').innerHTML = `
      <div class="group-details">
        <div class="detail-section">
          <h4>Group Information</h4>
          <p><strong>Name:</strong> ${group.groupName}</p>
          <p><strong>Course:</strong> ${group.course}</p>
          <p><strong>Subject:</strong> ${group.subject}</p>
          <p><strong>Level:</strong> ${group.level}</p>
          <p><strong>Created by:</strong> ${group.creatorName}</p>
        </div>
        
        <div class="detail-section">
          <h4>Meeting Details</h4>
          <p><strong>First Meeting:</strong> ${meetingDate.toLocaleDateString()} at ${meetingDate.toLocaleTimeString()}</p>
          <p><strong>Frequency:</strong> ${group.frequency}</p>
          <p><strong>Location:</strong> ${group.location}</p>
          <p><strong>Members:</strong> ${group.members.length}/${group.maxMembers}</p>
        </div>
        
        <div class="detail-section">
          <h4>Description</h4>
          <p>${group.description}</p>
        </div>
      </div>
    `;

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const isCreator = currentUser && currentUser.username === group.creator;
    const isMember = currentUser && group.members.includes(currentUser.username);
    const isFull = group.members.length >= group.maxMembers;

    const joinBtn = document.getElementById('joinFromDetailsBtn');
    if (isCreator || isMember || isFull) {
      joinBtn.style.display = 'none';
    } else {
      joinBtn.style.display = 'inline-flex';
    }

    detailsModal.style.display = 'block';
  };

  window.showJoinModal = function(groupId) {
    const group = allGroups.find(g => g.id === groupId);
    if (!group) return;

    currentGroup = group;
    const meetingDate = new Date(group.meetingTime);
    
    document.getElementById('joinGroupInfo').innerHTML = `
      <h4>${group.groupName}</h4>
      <p><strong>Course:</strong> ${group.course} - ${group.subject}</p>
      <p><strong>Meeting:</strong> ${meetingDate.toLocaleDateString()} at ${meetingDate.toLocaleTimeString()}</p>
      <p><strong>Location:</strong> ${group.location}</p>
      <p><strong>Members:</strong> ${group.members.length}/${group.maxMembers}</p>
    `;

    joinModal.style.display = 'block';
  };

  function joinGroup() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
      showNotification('Please sign in to join a group.', 'error');
      setTimeout(() => {
        window.location.href = 'signin.html';
      }, 2000);
      return;
    }

    if (!currentGroup) return;

    // Check if already a member
    if (currentGroup.members.includes(currentUser.username)) {
      showNotification('You are already a member of this group.', 'error');
      joinModal.style.display = 'none';
      return;
    }

    // Check if group is full
    if (currentGroup.members.length >= currentGroup.maxMembers) {
      showNotification('This group is already full.', 'error');
      joinModal.style.display = 'none';
      return;
    }

    // Add user to group
    currentGroup.members.push(currentUser.username);
    
    // Update localStorage
    const groupIndex = allGroups.findIndex(g => g.id === currentGroup.id);
    if (groupIndex !== -1) {
      allGroups[groupIndex] = currentGroup;
      localStorage.setItem('studyGroups', JSON.stringify(allGroups));
    }

    showNotification(`Successfully joined ${currentGroup.groupName}!`, 'success');
    joinModal.style.display = 'none';
    
    // Refresh the display
    displayGroups(allGroups);
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
});
