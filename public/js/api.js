// API Client for Mental Health Coach App
class MentalHealthAPI {
  constructor() {
    this.baseURL = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api' 
      : 'https://mental-health-coach-app.vercel.app/api';
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(email, password, name) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // User methods
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserPreferences(preferences) {
    return this.request('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    });
  }

  // Activities methods
  async getActivities(category = 'all', search = '') {
    const params = new URLSearchParams();
    if (category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    return this.request(`/activities${queryString ? '?' + queryString : ''}`);
  }

  async getRecommendedActivities() {
    return this.request('/activities/recommended');
  }

  // Progress methods
  async saveProgress(activityId, moodBefore, moodAfter, notes, duration) {
    return this.request('/progress', {
      method: 'POST',
      body: JSON.stringify({
        activityId,
        moodBefore,
        moodAfter,
        notes,
        duration,
      }),
    });
  }

  async getProgress() {
    return this.request('/progress');
  }

  // Goals methods
  async getGoals() {
    return this.request('/goals');
  }

  async createGoal(title, description, category, targetValue, unit, deadline) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        category,
        targetValue,
        unit,
        deadline,
      }),
    });
  }

  async updateGoal(goalId, currentValue, isCompleted) {
    return this.request(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify({ currentValue, isCompleted }),
    });
  }

  // Achievements methods
  async getAchievements() {
    return this.request('/achievements');
  }

  // Community methods
  async getCommunityPosts() {
    return this.request('/community/posts');
  }

  async createPost(content, isAnonymous = false, tags = []) {
    return this.request('/community/posts', {
      method: 'POST',
      body: JSON.stringify({ content, isAnonymous, tags }),
    });
  }

  async likePost(postId) {
    return this.request(`/community/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  // AI Chatbot methods
  async sendChatMessage(message) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getChatHistory() {
    return this.request('/chat/history');
  }

  // Quiz methods
  async submitQuiz(answers) {
    return this.request('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }
}

// Global API instance
window.api = new MentalHealthAPI();

// Authentication helper functions
window.auth = {
  async login(email, password) {
    try {
      const response = await api.login(email, password);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async register(email, password, name) {
    try {
      const response = await api.register(email, password, name);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout() {
    api.logout();
    window.location.href = 'index.html';
  },

  isAuthenticated() {
    return !!api.token;
  },

  async checkAuth() {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      await api.getUserProfile();
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }
};

// Utility functions
window.utils = {
  formatDate(date) {
    return new Date(date).toLocaleDateString();
  },

  formatTime(date) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-black' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  },

  showLoading(element) {
    element.disabled = true;
    element.innerHTML = '<span class="animate-spin">⏳</span> Loading...';
  },

  hideLoading(element, originalText) {
    element.disabled = false;
    element.innerHTML = originalText;
  },

  async handleApiCall(apiCall, loadingElement = null, originalText = '') {
    try {
      if (loadingElement) {
        this.showLoading(loadingElement);
      }
      
      const result = await apiCall();
      
      if (loadingElement) {
        this.hideLoading(loadingElement, originalText);
      }
      
      return result;
    } catch (error) {
      if (loadingElement) {
        this.hideLoading(loadingElement, originalText);
      }
      
      this.showNotification(error.message, 'error');
      throw error;
    }
  }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Check authentication status
  const isAuthenticated = await auth.checkAuth();
  
  // Add authentication state to body
  document.body.setAttribute('data-authenticated', isAuthenticated);
  
  // Initialize dark mode
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
  }
  
  // Add global error handler
  window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    utils.showNotification('An unexpected error occurred', 'error');
  });
  
  // Add unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    utils.showNotification('An unexpected error occurred', 'error');
  });
});
