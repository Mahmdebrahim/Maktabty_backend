// Kotoby Frontend Application
const API_URL = "http://localhost:5000";

const app = {
  currentUser: null,
  token: null,
  cart: [],
  favorites: [],
  books: [],
  categories: [],
  subCategories: [],
  currentUserBooks: [],
  currentPage: 1,
  totalPages: 1,
  filters: {},
  pendingOrder: null,
  currentReviewRating: 0,

  // Initialize app
  init() {
    this.checkAuth();
    this.loadCategories();
    this.setupEventListeners();
    this.showHome();
  },

  // Setup event listeners
  setupEventListeners() {
    document
      .getElementById("addBookForm")
      ?.addEventListener("submit", (e) => this.handleAddBook(e));
  },

  // Check if user is logged in
  async checkAuth() {
    const token = localStorage.getItem("token");
    if (token) {
      this.token = token;
      try {
        const response = await fetch(`${API_URL}/users/auth/profile`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.currentUser = data.data || data;
          this.updateUserUI();
        } else {
          this.logout();
        }
      } catch (err) {
        console.log("Auth check failed:", err);
      }
    }
  },

  // Update user UI
  updateUserUI() {
    const userDisplay = document.getElementById("userDisplay");
    const authBtn = document.getElementById("authBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const sellerBtn = document.getElementById("sellerBtn");
    const adminBtn = document.getElementById("adminBtn");
    const profileLink = document.getElementById("profileLink");

    if (this.currentUser) {
      userDisplay.textContent = `👤 ${this.currentUser.username}`;
      authBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
      profileLink.style.display = "inline";

      if (this.currentUser.role === "seller") {
        sellerBtn.style.display = "inline-block";
      }

      if (this.currentUser.role === "admin") {
        adminBtn.style.display = "inline-block";
      }
    } else {
      userDisplay.textContent = "Not logged in";
      authBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
      sellerBtn.style.display = "none";
      adminBtn.style.display = "none";
      profileLink.style.display = "none";
    }
  },

  // Show notification
  showNotification(message, type = "success") {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  },

  // Handle API Error - Extract message from response or error object
  handleError(error, customErrorElement = null) {
    let errorMessage = "An error occurred";

    // If error object has a message property
    if (error && error.message) {
      errorMessage = error.message;
    }
    // If error is a string
    else if (typeof error === "string") {
      errorMessage = error;
    }

    // Show in custom error element if provided
    if (customErrorElement) {
      const element = document.getElementById(customErrorElement);
      if (element) {
        element.textContent = errorMessage;
        element.classList.add("show");
      }
    } else {
      // Show as notification (error type)
      this.showNotification(errorMessage, "error");
    }

    console.error("Error:", errorMessage);
  },

  // Extract error message from API response
  async extractErrorMessage(response) {
    try {
      const data = await response.clone().json();
      // Backend sends message directly at top level
      return data.message || data.error || "Request failed";
    } catch {
      return response.statusText || "Request failed";
    }
  },

  // Toggle Auth Modal
  toggleAuthModal() {
    const modal = document.getElementById("authModal");
    modal.classList.toggle("active");
  },

  // Close Auth Modal
  closeAuthModal() {
    document.getElementById("authModal").classList.remove("active");
  },

  // Switch Auth Tab
  switchAuthTab(tab) {
    document
      .querySelectorAll(".auth-tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".auth-form")
      .forEach((form) => form.classList.remove("active"));

    document
      .querySelector(`[onclick*="switchAuthTab('${tab}')"]`)
      .classList.add("active");
    document.getElementById(`${tab}Form`).classList.add("active");
  },

  // Handle Login
  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      this.showLoader(true);
      const response = await fetch(`${API_URL}/users/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }

      this.currentUser = data.user;
      this.token = data.tokem || data.token;
      localStorage.setItem("token", this.token);

      this.updateUserUI();
      this.closeAuthModal();
      this.showNotification("✓ Logged in successfully");
      this.showHome();
    } catch (error) {
      this.handleError(error, "loginError");
    } finally {
      this.showLoader(false);
    }
  },

  // Handle Register
  async handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const phone = document.getElementById("registerPhone").value;
    const role = document.getElementById("registerRole").value;

    try {
      this.showLoader(true);
      const response = await fetch(`${API_URL}/users/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password, phone, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }

      this.showNotification("✓ Registration successful! Please log in.");
      this.switchAuthTab("login");
      document.getElementById("loginEmail").value = email;
    } catch (error) {
      this.handleError(error, "registerError");
    } finally {
      this.showLoader(false);
    }
  },

  // Logout
  logout() {
    localStorage.removeItem("token");
    this.currentUser = null;
    this.token = null;
    this.cart = [];
    this.favorites = [];
    this.updateUserUI();
    this.showNotification("✓ Logged out successfully");
    this.showHome();
  },

  // Show Loader
  showLoader(show) {
    document.getElementById("loader").style.display = show ? "block" : "none";
  },

  // Page Navigation
  showPage(pageId) {
    document
      .querySelectorAll(".page")
      .forEach((page) => page.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");
    window.scrollTo(0, 0);
  },

  showHome() {
    this.showPage("home");
  },

  showBooks() {
    this.showPage("books");
    this.loadBooks();
  },

  showFavorites() {
    if (!this.currentUser) {
      this.showNotification("Please log in first", "warning");
      this.toggleAuthModal();
      return;
    }
    this.showPage("favorites");
    this.loadFavorites();
  },

  showCart() {
    if (!this.currentUser) {
      this.showNotification("Please log in first", "warning");
      this.toggleAuthModal();
      return;
    }
    this.showPage("cart");
    this.loadCart();
  },

  showProfile() {
    if (!this.currentUser) {
      this.showNotification("Please log in first", "warning");
      this.toggleAuthModal();
      return;
    }
    this.showPage("profile");
    this.loadProfile();
  },

  showSellerPanel() {
    if (
      !this.currentUser ||
      (this.currentUser.role !== "seller" && this.currentUser.role !== "admin")
    ) {
      this.showNotification("Access denied", "error");
      return;
    }
    this.showPage("sellerPanel");
    this.loadMyBooks();
    this.loadCategories();
  },

  showAdminPanel() {
    if (!this.currentUser || this.currentUser.role !== "admin") {
      this.showNotification("Access denied", "error");
      return;
    }
    this.showPage("adminPanel");
    this.loadAdminUsers();
  },

  // Load Categories
  async loadCategories() {
    try {
      // Load parent categories
      const response = await fetch(`${API_URL}/categories/tree`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // Load all subcategories
      const subResponse = await fetch(`${API_URL}/categories/subcategories`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok && subResponse.ok) {
        const data = await response.json();
        const subData = await subResponse.json();

        this.categories = data.data || [];
        this.subCategories = subData.data || [];
        this.populateCategorySelects();
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.log("Error loading categories:", error);
    }
  },

  // Handle Category Filter Change
  onCategoryFilterChange() {
    const categoryId = document.getElementById("categoryFilter").value;
    const subCategoryFilter = document.getElementById("subcategoryFilter");

    subCategoryFilter.innerHTML =
      '<option value="">All Sub Categories</option>';

    if (!categoryId) {
      // Show all subcategories when no category selected
      this.subCategories.forEach((subCat) => {
        subCategoryFilter.innerHTML += `<option value="${subCat._id}">${subCat.name}</option>`;
      });
    } else {
      // Find subcategories belonging to selected category
      const selectedCat = this.categories.find((cat) => cat._id === categoryId);

      if (
        selectedCat &&
        selectedCat.children &&
        selectedCat.children.length > 0
      ) {
        selectedCat.children.forEach((subCat) => {
          subCategoryFilter.innerHTML += `<option value="${subCat._id}">${subCat.name}</option>`;
        });
      }
    }

    this.filterBooks();
  },

  // Handle Category Change (for add book form)
  onCategoryChange() {
    const categoryId = document.getElementById("bookCategory").value;
    const subCategorySelect = document.getElementById("bookSubCategory");

    subCategorySelect.innerHTML =
      '<option value="">Select Sub Category</option>';

    if (!categoryId) return;

    // Find the selected category
    const selectedCat = this.categories.find((cat) => cat._id === categoryId);

    if (
      selectedCat &&
      selectedCat.children &&
      selectedCat.children.length > 0
    ) {
      selectedCat.children.forEach((subCat) => {
        subCategorySelect.innerHTML += `<option value="${subCat._id}">${subCat.name}</option>`;
      });
    }
  },

  // Populate category selects
  populateCategorySelects() {
    const categorySelect = document.getElementById("bookCategory");
    const categoryFilter = document.getElementById("categoryFilter");
    const subcategoryFilter = document.getElementById("subcategoryFilter");
    const categoryParent = document.getElementById("categoryParent");

    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Select Category</option>';
      this.categories.forEach((cat) => {
        categorySelect.innerHTML += `<option value="${cat._id}">${cat.name}</option>`;
      });
    }

    if (categoryFilter) {
      categoryFilter.innerHTML = '<option value="">All Categories</option>';
      this.categories.forEach((cat) => {
        categoryFilter.innerHTML += `<option value="${cat._id}">${cat.name}</option>`;
      });
    }

    if (subcategoryFilter) {
      subcategoryFilter.innerHTML =
        '<option value="">All Sub Categories</option>';
      this.subCategories.forEach((subCat) => {
        subcategoryFilter.innerHTML += `<option value="${subCat._id}">${subCat.name}</option>`;
      });
    }

    if (categoryParent) {
      categoryParent.innerHTML =
        '<option value="">Parent Category (optional)</option>';
      this.categories.forEach((cat) => {
        categoryParent.innerHTML += `<option value="${cat._id}">${cat.name}</option>`;
      });
    }
  },

  // Load Books
  async loadBooks() {
    if (!this.currentUser) {
      this.showNotification("Please log in first", "warning");
      this.toggleAuthModal();
      return;
    }

    try {
      this.showLoader(true);
      const params = new URLSearchParams({
        page: this.currentPage,
        limit: 10,
        ...this.filters,
      });

      const response = await fetch(`${API_URL}/books?${params}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.books = data.data || [];
        this.totalPages = data.pagination.totalPages;
        this.currentPage = parseInt(data.pagination.currentPage);

        this.renderBooks();
        document.getElementById(
          "pageInfo"
        ).textContent = `Page ${this.currentPage} of ${this.totalPages}`;
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.showLoader(false);
    }
  },

  // Filter Books
  filterBooks() {
    this.filters = {
      search: document.getElementById("searchInput")?.value || "",
      category: document.getElementById("categoryFilter")?.value || "",
      subCategory: document.getElementById("subcategoryFilter")?.value || "",
      minPrice: document.getElementById("minPrice")?.value || "",
      maxPrice: document.getElementById("maxPrice")?.value || "",
      condition: document.getElementById("conditionFilter")?.value || "",
    };

    Object.keys(this.filters).forEach(
      (key) => !this.filters[key] && delete this.filters[key]
    );

    this.currentPage = 1;
    this.loadBooks();
  },

  // Render Books
  renderBooks() {
    const booksList = document.getElementById("booksList");
    booksList.innerHTML = "";

    if (this.books.length === 0) {
      booksList.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <h3>📚 No books found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            `;
      return;
    }

    this.books.forEach((book) => {
      const isFavorite = this.favorites.some((fav) => fav._id === book._id);
      const image = book.images || "download (2).jpeg";
      const isOutOfStock = book.quantity <= 0 || book.isSoldOut;
      const stockStatus = isOutOfStock
        ? "Out of Stock"
        : `In Stock (${book.quantity})`;
      const stockClass = isOutOfStock ? "out-of-stock" : "in-stock";

      booksList.innerHTML += `
                <div class="book-card ${isOutOfStock ? "disabled" : ""}">
                    <div class="book-image">
                        <img src="${image}" alt="${
        book.title
      }" onerror="this.src='https://via.placeholder.com/250x200?text=Book'">
                        ${
                          isOutOfStock
                            ? '<div class="stock-badge out-of-stock">Out of Stock</div>'
                            : '<div class="stock-badge in-stock">In Stock</div>'
                        }
                    </div>
                    <div class="book-info">
                        <div class="book-title">${book.title}</div>
                        <div class="book-author">${
                          book.author?.join(", ") || "Unknown"
                        }</div>
                        <div class="book-meta">
                            <span class="book-condition">${
                              book.condition
                            }</span>
                            <span>${book.publishedYear}</span>
                            <span class="stock-info ${stockClass}">${stockStatus}</span>
                        </div>
                        <div class="book-price">EGP ${book.price}</div>
                        <div class="book-seller">📍 ${
                          book.seller?.username || "Unknown seller"
                        }</div>
                        <div class="book-actions">
                            <button class="btn-view" onclick="app.viewBook('${
                              book._id
                            }')">View</button>
                            <button class="btn-cart ${
                              isOutOfStock ? "disabled" : ""
                            }" onclick="${
        isOutOfStock
          ? "return false"
          : `app.addToCart('${book._id}', ${book.price})`
      }" ${isOutOfStock ? "disabled" : ""}>Add</button>
                            <button class="btn-favorite ${
                              isFavorite ? "active" : ""
                            }" onclick="app.toggleFavorite('${
        book._id
      }')">❤</button>
                        </div>
                    </div>
                </div>
            `;
    });
  },

  // View Book
  async viewBook(bookId) {
    try {
      const response = await fetch(`${API_URL}/books/${bookId}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const book = data.data;
        const image = book.images || "download (2).jpeg";
        const isOutOfStock = book.quantity <= 0 || book.isSoldOut;
        const stockText = isOutOfStock
          ? `Out of Stock`
          : `In Stock (${book.quantity})`;
        const stockClass = isOutOfStock ? "out-of-stock" : "in-stock";

        document.getElementById("bookDetail").innerHTML = `
                    <div class="book-detail">
                    <h2>${book.title}</h2>
                        <div class="book-detail-image">
                            <img src="${image}" alt="${book.title}" >
                        </div>
                        <div class="book-detail-info">
                            
                            <div class="detail-meta">
                                <p>
                                <strong>Authors:</strong> ${
                                  book.author?.join(", ") || "Unknown"
                                }</p>
                                <p><strong>Published Year:</strong> ${
                                  book.publishedYear
                                }</p>
                                <p><strong>Price:</strong> EGP ${book.price}</p>
                                <p><strong>Condition:</strong> ${
                                  book.condition
                                }</p>
                                <p><strong>Stock:</strong> <span class="stock-info ${stockClass}">${stockText}</span></p>
                                <p><strong>Category:</strong> ${
                                  book.category?.name || "N/A"
                                }</p>
                                <p><strong>Seller:</strong> ${
                                  book.seller?.username || "Unknown"
                                }</p>
                                <p><strong>Seller Phone:</strong> ${
                                  book.seller?.phone || "N/A"
                                }</p>
                            </div>
                            <div class="detail-description">
                                <strong>Description:</strong><br>${
                                  book.description || "No description available"
                                }
                            </div>
                            <div class="detail-actions">
                                <button class="btn-primary ${
                                  isOutOfStock ? "disabled" : ""
                                }" onclick="${
          isOutOfStock
            ? "return false"
            : `app.addToCart('${book._id}', ${book.price})`
        }" ${isOutOfStock ? "disabled" : ""}>
                                  ${
                                    isOutOfStock
                                      ? "Out of Stock"
                                      : "Add to Cart"
                                  }
                                </button>
                                <button class="btn-secondary" onclick="app.toggleFavorite('${
                                  book._id
                                }')">❤️ Add to Favorites</button>
                            </div>
                            
                            <div class="reviews-section">
                              <h3>Reviews & Ratings</h3>
                              <div id="reviewsList" class="reviews-list"></div>
                              <div id="reviewForm" class="review-form">
                                <h4>Add Your Review</h4>
                                <div class="rating-input">
                                  <label>Rating:</label>
                                  <div class="stars">
                                    ${[1, 2, 3, 4, 5]
                                      .map(
                                        (star) =>
                                          `<span class="star" onclick="app.setReviewRating(${star})" data-rating="${star}">★</span>`
                                      )
                                      .join("")}
                                  </div>
                                  <span id="ratingValue">0/5</span>
                                </div>
                                <textarea id="reviewComment" placeholder="Share your thoughts..." maxlength="2000"></textarea>
                                <button onclick="app.submitReview('${
                                  book._id
                                }')" class="btn-primary">Submit Review</button>
                              </div>
                            </div>
                        </div>
                    </div>
                `;

        document.getElementById("bookModal").classList.add("active");

        // Load reviews
        this.loadReviews(bookId);
      }
    } catch (error) {
      console.log("Error viewing book:", error);
    }
  },

  // Set Review Rating
  setReviewRating(rating) {
    this.currentReviewRating = rating;
    document.getElementById("ratingValue").textContent = `${rating}/5`;

    // Update star display
    document.querySelectorAll(".star").forEach((star) => {
      const starRating = parseInt(star.dataset.rating);
      star.classList.toggle("active", starRating <= rating);
    });
  },

  // Load Reviews
  async loadReviews(bookId) {
    try {
      const response = await fetch(`${API_URL}/reviews/${bookId}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.displayReviews(data.data || [], data.averageRating || 0);
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        console.warn("Error loading reviews:", errorMsg);
        document.getElementById("reviewsList").innerHTML = `
          <div class="empty-reviews">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        `;
      }
    } catch (error) {
      console.log("Error loading reviews:", error);
      document.getElementById("reviewsList").innerHTML = `
        <div class="empty-reviews">
          <p>No reviews yet. Be the first to review!</p>
        </div>
      `;
    }
  },

  // Display Reviews
  displayReviews(reviews, avgRating) {
    const reviewsList = document.getElementById("reviewsList");

    if (!reviews || reviews.length === 0) {
      reviewsList.innerHTML = `
        <div class="empty-reviews">
          <p>No reviews yet. Be the first to review!</p>
        </div>
      `;
      return;
    }

    let reviewsHTML = `
      <div class="reviews-stats">
        <div class="avg-rating">
          <div class="rating-number">${avgRating.toFixed(1)}</div>
          <div class="rating-stars">${"★".repeat(
            Math.round(avgRating)
          )}${"☆".repeat(5 - Math.round(avgRating))}</div>
          <p>Based on ${reviews.length} review${
      reviews.length !== 1 ? "s" : ""
    }</p>
        </div>
      </div>
      <div class="reviews-container">
    `;

    reviews.forEach((review) => {
      const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
      reviewsHTML += `
        <div class="review-item">
          <div class="review-header">
            <strong>${review.user?.username || "Anonymous"}</strong>
            <span class="review-rating">${stars}</span>
          </div>
          <p class="review-comment">${review.comment || "No comment"}</p>
          <small class="review-date">${new Date(
            review.createdAt
          ).toLocaleDateString()}</small>
        </div>
      `;
    });

    reviewsHTML += "</div>";
    reviewsList.innerHTML = reviewsHTML;
  },

  // Submit Review
  async submitReview(bookId) {
    if (!this.currentUser) {
      this.showNotification("Please log in to submit a review", "warning");
      return;
    }

    const rating = this.currentReviewRating || 0;
    const comment = document.getElementById("reviewComment")?.value || "";

    if (rating === 0) {
      this.showNotification("Please select a rating", "warning");
      return;
    }

    try {
      this.showLoader(true);

      const response = await fetch(`${API_URL}/reviews/${bookId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ rating, comment }),
      });

      if (response.ok) {
        this.showNotification("✓ Review submitted successfully");

        // Reset form
        this.currentReviewRating = 0;
        document.getElementById("ratingValue").textContent = "0/5";
        document.getElementById("reviewComment").value = "";
        document
          .querySelectorAll(".star")
          .forEach((star) => star.classList.remove("active"));

        // Reload reviews
        this.loadReviews(bookId);
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.showLoader(false);
    }
  },

  // Add to Cart
  async addToCart(bookId, price) {
    if (!this.currentUser) {
      this.showNotification("Please log in first", "warning");
      this.toggleAuthModal();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bookId: bookId,
          quantity: 1,
          price: price,
        }),
      });

      if (response.ok) {
        this.showNotification("✓ Added to cart");
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
    }
  },

  // Toggle Favorite
  async toggleFavorite(bookId) {
    if (!this.currentUser) {
      this.showNotification("Please log in first", "warning");
      this.toggleAuthModal();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/favorites/toggle`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ bookId }),
      });

      if (response.ok) {
        const isFavorite = this.favorites.some((fav) => fav._id === bookId);
        this.showNotification(
          isFavorite ? "✓ Removed from favorites" : "✓ Added to favorites"
        );
        this.loadFavorites();
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
    }
  },

  // Load Favorites
  async loadFavorites() {
    if (!this.currentUser) return;

    try {
      const response = await fetch(`${API_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.favorites = data.data.favorites || [];
        this.renderFavorites();
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.log("Error loading favorites:", error);
    }
  },

  // Render Favorites
  renderFavorites() {
    const favoritesList = document.getElementById("favoritesList");
    favoritesList.innerHTML = "";

    if (this.favorites.length === 0) {
      favoritesList.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <h3>❤️ No favorites yet</h3>
                    <p>Add some books to your favorites</p>
                </div>
            `;
      return;
    }

    this.favorites.forEach((book) => {
      const image = book.images;
      const isOutOfStock = book.quantity <= 0 || book.isSoldOut;
      const stockStatus = isOutOfStock
        ? "Out of Stock"
        : `In Stock (${book.quantity})`;
      const stockClass = isOutOfStock ? "out-of-stock" : "in-stock";

      favoritesList.innerHTML += `
                <div class="book-card ${isOutOfStock ? "disabled" : ""}">
                    <div class="book-image">
                        <img src="${image}" alt="${book.title}">
                        ${
                          isOutOfStock
                            ? '<div class="stock-badge out-of-stock">Out of Stock</div>'
                            : '<div class="stock-badge in-stock">In Stock</div>'
                        }
                    </div>
                    <div class="book-info">
                        <div class="book-title">${book.title}</div>
                        <div class="book-author">${
                          book.author?.join(", ") || "Unknown"
                        }</div>
                        <div class="book-price">EGP ${book.price}</div>
                        <div class="book-meta">
                            <span class="stock-info ${stockClass}">${stockStatus}</span>
                        </div>
                        <div class="book-actions">
                            <button class="btn-view" onclick="app.viewBook('${
                              book._id
                            }')">View</button>
                            <button class="btn-cart ${
                              isOutOfStock ? "disabled" : ""
                            }" onclick="${
        isOutOfStock
          ? "return false"
          : `app.addToCart('${book._id}', ${book.price})`
      }" ${isOutOfStock ? "disabled" : ""}>Add</button>
                            <button class="btn-favorite active" onclick="app.toggleFavorite('${
                              book._id
                            }')">❤</button>
                        </div>
                    </div>
                </div>
            `;
    });
  },

  // Load Cart from API
  async loadCart() {
    if (!this.currentUser) return;

    try {
      this.showLoader(true);
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.cart = data.data || [];
        this.renderCart();
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.showLoader(false);
    }
  },

  // Render Cart
  renderCart() {
    const cartItemsList = document.getElementById("cartItemsList");
    cartItemsList.innerHTML = "";

    if (!this.cart || this.cart.length === 0) {
      cartItemsList.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <h3>🛒 Your cart is empty</h3>
                    <p><a href="#" onclick="app.showBooks()" style="color: var(--secondary-color);">Continue shopping</a></p>
                </div>
            `;
      this.updateCartSummary([]);
      return;
    }

    let totalPrice = 0;

    this.cart.forEach((item, index) => {
      const image =
        item.images || "https://via.placeholder.com/100x100?text=Book";
      const subtotal = item.price * item.quantity;
      totalPrice += subtotal;

      cartItemsList.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${image}" alt="${
        item.title
      }" onerror="this.src='https://via.placeholder.com/100x100?text=Book'">
                    </div>
                    <div class="cart-item-details">
                        <h3>${item.title}</h3>
                        <p>Authors: ${item.author?.join(", ") || "Unknown"}</p>
                        <p>Price: EGP ${item.price}</p>
                        <p>Condition: ${item.condition}</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button onclick="app.updateCartQuantity('${
                              item._id
                            }', -1)">-</button>
                            <input type="number" value="${
                              item.quantity
                            }" readonly>
                            <button onclick="app.updateCartQuantity('${
                              item._id
                            }', 1)">+</button>
                        </div>
                        <button class="btn-danger" onclick="app.removeFromCart('${
                          item._id
                        }')">Remove</button>
                        <div style="text-align: right;">
                            <strong>EGP ${subtotal}</strong>
                        </div>
                    </div>
                </div>
            `;
    });

    this.updateCartSummary(this.cart);
  },

  // Update Cart Summary
  updateCartSummary(cartItems) {
    let subtotal = 0;
    cartItems.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    const shippingCost = 30;
    const total = subtotal + shippingCost;

    document.getElementById("subtotal").textContent = `EGP ${subtotal}`;
    document.getElementById("shippingCost").textContent = `EGP ${shippingCost}`;
    document.getElementById("totalPrice").textContent = `EGP ${total}`;
    document.getElementById("checkoutTotal").textContent = `EGP ${total}`;
  },

  // Update Cart Quantity
  async updateCartQuantity(bookId, change) {
    const item = this.cart.find((i) => i._id === bookId);
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.removeFromCart(bookId);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart/${bookId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        this.showNotification("✓ Cart updated");
        await this.loadCart();
      } else {
        this.showNotification("Failed to update cart", "error");
      }
    } catch (error) {
      console.log("Error updating cart:", error);
      this.showNotification("Error updating cart", "error");
    }
  },

  // Remove from Cart
  async removeFromCart(bookId) {
    try {
      const response = await fetch(`${API_URL}/cart/remove/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        this.showNotification("✓ Item removed from cart");
        await this.loadCart();
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
    }
  },

  // Show Checkout
  showCheckout() {
    if (!this.cart || this.cart.length === 0) {
      this.showNotification("Cart is empty", "warning");
      return;
    }
    document.getElementById("checkoutModal").classList.add("active");
  },

  // Close Checkout
  closeCheckout() {
    document.getElementById("checkoutModal").classList.remove("active");
  },

  // Process Order
  async processOrder(event) {
    event.preventDefault();

    const shippingAddress = {
      fullname: document.getElementById("fullname").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
    };

    const paymentMethod = document.getElementById("paymentMethod").value;

    // Validate inputs
    if (
      !shippingAddress.fullname ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city
    ) {
      this.showNotification("Please fill all shipping address fields", "error");
      return;
    }

    if (!paymentMethod) {
      this.showNotification("Please select a payment method", "error");
      return;
    }

    // Store order data for payment processing
    this.pendingOrder = {
      shippingAddress,
      paymentMethod,
    };

    // Show payment modal based on method
    this.showPaymentModal(paymentMethod);
  },

  // Show Payment Modal
  showPaymentModal(paymentMethod) {
    this.closeCheckout();

    switch (paymentMethod) {
      case "cash":
        document.getElementById("cashPaymentModal").classList.add("active");
        break;
      case "card":
        document.getElementById("cardPaymentModal").classList.add("active");
        break;
      case "online":
        document.getElementById("onlinePaymentModal").classList.add("active");
        break;
      case "wallet":
        this.updateWalletInfo();
        document.getElementById("walletPaymentModal").classList.add("active");
        break;
    }
  },

  // Close Payment Modal
  closePaymentModal() {
    document
      .querySelectorAll(".modal")
      .forEach((modal) => modal.classList.remove("active"));
  },

  // Process Card Payment
  async processCardPayment(event) {
    event.preventDefault();

    const cardNumber = document.getElementById("cardNumber").value;
    const cardExpiry = document.getElementById("cardExpiry").value;
    const cardCvv = document.getElementById("cardCvv").value;
    const cardHolder = document.getElementById("cardHolder").value;

    // Simple validation
    if (cardNumber.length < 15 || cardCvv.length < 3) {
      this.showNotification("Invalid card details", "error");
      return;
    }

    // Simulate payment processing
    this.showLoader(true);
    setTimeout(() => {
      this.showLoader(false);
      this.processPaymentSimulation("card");
    }, 2000);
  },

  // Update Wallet Info
  updateWalletInfo() {
    // Simulate wallet balance
    const walletBalance = Math.random() * 500;
    const cartTotal = parseFloat(
      document.getElementById("checkoutTotal").textContent.replace("EGP ", "")
    );

    document.getElementById(
      "walletBalance"
    ).textContent = `EGP ${walletBalance.toFixed(2)}`;

    const walletMessage = document.getElementById("walletMessage");
    if (walletBalance >= cartTotal) {
      walletMessage.innerHTML = `<p class="success">✓ Sufficient balance available</p>`;
      document.getElementById("confirmWalletBtn").disabled = false;
    } else {
      const needed = (cartTotal - walletBalance).toFixed(2);
      walletMessage.innerHTML = `<p class="error">⚠️ Insufficient balance (Need EGP ${needed} more)</p>`;
      document.getElementById("confirmWalletBtn").disabled = true;
    }
  },

  // Process Payment Simulation
  async processPaymentSimulation(method) {
    this.closePaymentModal();
    this.showLoader(true);

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update payment method in pending order
    this.pendingOrder.paymentMethod = method;

    try {
      const response = await fetch(`${API_URL}/orders/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(this.pendingOrder),
      });

      const data = await response.json();

      if (response.ok) {
        this.showLoader(false);
        this.showPaymentSuccessModal(method, data.data || data);
      } else {
        throw new Error(data.message || data.error || "Failed to create order");
      }
    } catch (error) {
      this.showLoader(false);
      this.showNotification(error.message, "error");
      this.closePaymentModal();
    }
  },

  // Show Payment Success Modal
  showPaymentSuccessModal(method, orderData) {
    const methodNames = {
      cash: "Cash on Delivery",
      card: "Credit Card",
      online: "Online Payment",
      wallet: "Wallet",
      fawry: "Fawry",
      payfort: "PayFort",
      stripe: "Stripe",
      paypal: "PayPal",
    };

    document.getElementById("confirmationMessage").textContent = `Payment via ${
      methodNames[method] || method
    } confirmed!`;
    document.getElementById("confirmationDetails").textContent = `Order #${(
      orderData._id || ""
    )
      .substring(0, 8)
      .toUpperCase()} created successfully`;

    document.getElementById("paymentSuccessModal").classList.add("active");
  },

  // Complete Payment Process
  async completePaymentProcess() {
    document.getElementById("paymentSuccessModal").classList.remove("active");
    await this.loadCart();
    this.showNotification("✓ Order placed successfully!", "success");
    this.showCart();
    this.pendingOrder = null;
  },

  // Seller Panel - Load My Books
  async loadMyBooks() {
    if (!this.currentUser) return;

    try {
      const response = await fetch(
        `${API_URL}/books?seller=${this.currentUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        this.renderMyBooks(data.data || []);
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
    }
  },

  // Render My Books
  renderMyBooks(books) {
    // Store books for edit reference
    this.currentUserBooks = books;

    const myBooksList = document.getElementById("myBooksList");
    myBooksList.innerHTML = "";

    if (books.length === 0) {
      myBooksList.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <h3>📚 No books yet</h3>
                    <p>Add your first book from the "Add Book" tab</p>
                </div>
            `;
      return;
    }

    books.forEach((book) => {
      const image = book.images;
      const isOutOfStock = book.quantity <= 0 || book.isSoldOut;
      const stockStatus = isOutOfStock
        ? "Out of Stock"
        : `In Stock (${book.quantity})`;
      const stockClass = isOutOfStock ? "out-of-stock" : "in-stock";

      myBooksList.innerHTML += `
                <div class="book-card ${isOutOfStock ? "disabled" : ""}">
                    <div class="book-image">
                        <img src="${image}" alt="${
        book.title
      }" onerror="this.src='download (2).jpeg'">
                        ${
                          isOutOfStock
                            ? '<div class="stock-badge out-of-stock">Out of Stock</div>'
                            : '<div class="stock-badge in-stock">In Stock</div>'
                        }
                    </div>
                    <div class="book-info">
                        <div class="book-title">${book.title}</div>
                        <div class="book-author">${
                          book.author?.join(", ") || "Unknown"
                        }</div>
                        <div class="book-price">EGP ${book.price}</div>
                        <div class="book-meta">
                            <span class="book-condition">${
                              book.condition
                            }</span>
                            <span class="stock-info ${stockClass}">${stockStatus}</span>
                        </div>
                        <div class="book-actions">
                            <button class="btn-secondary" onclick="app.editBook('${
                              book._id
                            }')">Edit</button>
                            <button class="btn-danger" onclick="app.deleteBook('${
                              book._id
                            }')">Delete</button>
                        </div>
                    </div>
                </div>
            `;
    });
  },

  // Handle Add Book
  async handleAddBook(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector("button[type='submit']");
    const isEdit = submitBtn.dataset.isEdit === "true";
    const bookId = submitBtn.dataset.bookId;

    const book = {
      title: document.getElementById("bookTitle").value,
      author: document
        .getElementById("bookAuthors")
        .value.split(",")
        .map((a) => a.trim()),
      publishedYear: parseInt(document.getElementById("bookYear").value),
      price: parseFloat(document.getElementById("bookPrice").value),
      quantity: parseInt(document.getElementById("bookQuantity").value),
      description: document.getElementById("bookDescription").value,
      category: document.getElementById("bookCategory").value,
      condition: document.getElementById("bookCondition").value,
      images: document.getElementById("bookImages").value,
    };

    // Add subCategory only if it has a value
    const subCategoryValue = document.getElementById("bookSubCategory")?.value;
    if (subCategoryValue) {
      book.subCategory = subCategoryValue;
    }

    try {
      this.showLoader(true);

      let url = `${API_URL}/books`;
      let method = "POST";

      // If editing, use PATCH method and specific book ID
      if (isEdit && bookId) {
        url = `${API_URL}/books/${bookId}`;
        method = "PATCH";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(book),
      });

      if (response.ok) {
        const message = isEdit
          ? "✓ Book updated successfully"
          : "✓ Book added successfully";
        this.showNotification(message);
        document.getElementById("addBookForm").reset();

        // Reset button state
        submitBtn.textContent = "Add Book";
        delete submitBtn.dataset.bookId;
        delete submitBtn.dataset.isEdit;

        this.loadMyBooks();
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.showLoader(false);
    }
  },

  // Edit Book
  editBook(bookId) {
    // Find the book in myBooks list
    const book = this.currentUserBooks?.find((b) => b._id === bookId);

    if (!book) {
      this.showNotification("Book not found", "error");
      return;
    }

    // Populate form with book data
    document.getElementById("bookTitle").value = book.title || "";
    document.getElementById("bookAuthors").value = (book.author || []).join(
      ", "
    );
    document.getElementById("bookYear").value = book.publishedYear || "";
    document.getElementById("bookPrice").value = book.price || "";
    document.getElementById("bookQuantity").value = book.quantity || "";
    document.getElementById("bookDescription").value = book.description || "";
    document.getElementById("bookCategory").value =
      book.category?._id || book.category || "";
    document.getElementById("bookSubCategory").value =
      book.subCategory?._id || book.subCategory || "";
    document.getElementById("bookCondition").value = book.condition || "";
    document.getElementById("bookImages").value = book.images || [];

    // Update subcategory dropdown if category is selected
    if (book.category) {
      setTimeout(() => this.onCategoryChange(), 0);
      setTimeout(() => {
        document.getElementById("bookSubCategory").value =
          book.subCategory?._id || book.subCategory || "";
      }, 100);
    }

    // Change button text and store bookId for update
    const submitBtn = document.querySelector("#addBookForm button");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Update Book";
    submitBtn.dataset.bookId = bookId;
    submitBtn.dataset.isEdit = "true";

    // Scroll to form
    document
      .getElementById("addBookTab")
      .scrollIntoView({ behavior: "smooth" });

    // Switch to Add Book tab
    this.switchSellerTab("addBook");

    this.showNotification("Edit book details and click Update", "warning");
  },

  // Delete Book
  async deleteBook(bookId) {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      this.showLoader(true);

      const response = await fetch(`${API_URL}/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        this.showNotification("✓ Book deleted successfully");
        this.loadMyBooks();
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.showLoader(false);
    }
  },

  // Switch Seller Tab
  switchSellerTab(tab) {
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));

    document
      .querySelector(`[onclick*="switchSellerTab('${tab}')"]`)
      .classList.add("active");
    document.getElementById(`${tab}Tab`).classList.add("active");

    if (tab === "mySales") {
      this.loadMySales();
    }
  },

  // Load My Sales
  async loadMySales() {
    try {
      this.showLoader(true);

      const response = await fetch(`${API_URL}/orders/my-sales`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.renderMySales(data.data || []);
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.showLoader(false);
    }
  },

  // Render My Sales
  renderMySales(orders) {
    const mySalesList = document.getElementById("mySalesList");
    mySalesList.innerHTML = "";

    if (orders.length === 0) {
      mySalesList.innerHTML = `
                <div class="empty-state">
                    <h3>📊 No sales yet</h3>
                </div>
            `;
      return;
    }

    mySalesList.innerHTML = `
            <div class="admin-table">
                <div class="table-header">
                    <div>Order #</div>
                    <div>Customer</div>
                    <div>Total</div>
                    <div>Status</div>
                    <div>Date</div>
                    <div>Actions</div>
                </div>
                ${orders
                  .map(
                    (order) => `
                    <div class="table-row">
                        <div>${order.orderNumber}</div>
                        <div>${order.customer?.username || "Unknown"}</div>
                        <div>EGP ${order.totalAmount}</div>
                        <div>${order.status}</div>
                        <div>${new Date(
                          order.orderDate
                        ).toLocaleDateString()}</div>
                        <div class="table-actions">
                            <button class="btn-secondary" onclick="app.viewOrderDetails('${
                              order._id
                            }')">View</button>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  },

  // Admin Panel Functions
  async loadAdminUsers() {
    try {
      this.showLoader(true);

      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.renderAdminUsers(data.data || []);
      }
    } catch (error) {
      console.log("Error loading users:", error);
    } finally {
      this.showLoader(false);
    }
  },

  // Render Admin Users
  renderAdminUsers(users) {
    const usersList = document.getElementById("usersList");
    usersList.innerHTML = "";

    if (users.length === 0) {
      usersList.innerHTML = '<div class="empty-state">No users found</div>';
      return;
    }

    usersList.innerHTML = `
            <div class="admin-table">
                <div class="table-header">
                    <div>Username</div>
                    <div>Email</div>
                    <div>Phone</div>
                    <div>Role</div>
                    <div>Actions</div>
                </div>
                ${users
                  .map(
                    (user) => `
                    <div class="table-row">
                        <div>${user.username}</div>
                        <div>${user.email}</div>
                        <div>${user.phone}</div>
                        <div>${user.role}</div>
                        <div class="table-actions">
                            <button class="btn-danger" onclick="app.deleteAdminUser('${user._id}')">Delete</button>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  },

  // Delete Admin User
  async deleteAdminUser(userId) {
    if (!confirm("Delete this user?")) return;

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        this.showNotification("✓ User deleted");
        this.loadAdminUsers();
      }
    } catch (error) {
      this.showNotification("Error deleting user", "error");
    }
  },

  // Switch Admin Tab
  switchAdminTab(tab) {
    document
      .querySelectorAll(".admin-tabs .tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));

    document
      .querySelector(`.admin-tabs [onclick*="switchAdminTab('${tab}')"]`)
      .classList.add("active");
    document.getElementById(`${tab}Tab`).classList.add("active");

    if (tab === "books") this.loadAdminBooks();
    if (tab === "orders") this.loadAdminOrders();
    if (tab === "categories") this.loadAdminCategories();
  },

  // Load Admin Books
  async loadAdminBooks() {
    try {
      const response = await fetch(`${API_URL}/admin/books`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.renderAdminBooks(data.data || []);
      }
    } catch (error) {
      console.log("Error loading admin books:", error);
    }
  },

  // Render Admin Books
  renderAdminBooks(books) {
    const adminBooksList = document.getElementById("adminBooksList");
    adminBooksList.innerHTML = "";

    if (books.length === 0) {
      adminBooksList.innerHTML =
        '<div class="empty-state">No books found</div>';
      return;
    }

    adminBooksList.innerHTML = `
            <div class="admin-table">
                <div class="table-header">
                    <div>Title</div>
                    <div>Seller</div>
                    <div>Price</div>
                    <div>Quantity</div>
                    <div>Actions</div>
                </div>
                ${books
                  .map(
                    (book) => `
                    <div class="table-row">
                        <div>${book.title}</div>
                        <div>${book.seller?.username || "Unknown"}</div>
                        <div>EGP ${book.price}</div>
                        <div>${book.quantity}</div>
                        <div class="table-actions">
                            <button class="btn-danger" onclick="app.deleteAdminBook('${
                              book._id
                            }')">Delete</button>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  },

  // Delete Admin Book
  async deleteAdminBook(bookId) {
    if (!confirm("Delete this book?")) return;

    try {
      const response = await fetch(`${API_URL}/admin/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        this.showNotification("✓ Book deleted");
        this.loadAdminBooks();
      }
    } catch (error) {
      this.showNotification("Error deleting book", "error");
    }
  },

  // Load Admin Orders
  async loadAdminOrders() {
    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.renderAdminOrders(data.data || []);
      }
    } catch (error) {
      console.log("Error loading admin orders:", error);
    }
  },

  // Render Admin Orders
  renderAdminOrders(orders) {
    const adminOrdersList = document.getElementById("adminOrdersList");
    adminOrdersList.innerHTML = "";

    if (orders.length === 0) {
      adminOrdersList.innerHTML =
        '<div class="empty-state">No orders found</div>';
      return;
    }

    adminOrdersList.innerHTML = `
            <div class="admin-table">
                <div class="table-header">
                    <div>Order #</div>
                    <div>Customer</div>
                    <div>Total</div>
                    <div>Status</div>
                    <div>Date</div>
                </div>
                ${orders
                  .map(
                    (order) => `
                    <div class="table-row">
                        <div>${order.orderNumber}</div>
                        <div>${order.customer?.username || "Unknown"}</div>
                        <div>EGP ${order.totalAmount}</div>
                        <div>${order.status}</div>
                        <div>${new Date(
                          order.orderDate
                        ).toLocaleDateString()}</div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;
  },

  // Load Admin Categories
  async loadAdminCategories() {
    try {
      const response = await fetch(`${API_URL}/categories/tree`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.renderAdminCategories(data.data || []);
      }
    } catch (error) {
      console.log("Error loading categories:", error);
    }
  },

  // Render Admin Categories
  renderAdminCategories(categories) {
    const categoriesList = document.getElementById("categoriesList");
    categoriesList.innerHTML = "";

    const renderCategory = (category, level = 0) => {
      return `
                <div class="category-item" style="margin-left: ${
                  level * 20
                }px;">
                    <span class="category-item-title">${category.name}</span>
                </div>
                ${
                  category.children
                    ?.map((child) => renderCategory(child, level + 1))
                    .join("") || ""
                }
            `;
    };

    if (categories.length === 0) {
      categoriesList.innerHTML =
        '<div class="empty-state">No categories found</div>';
      return;
    }

    categoriesList.innerHTML = categories
      .map((cat) => renderCategory(cat))
      .join("");
  },

  // Add Category
  async addCategory() {
    const name = document.getElementById("categoryName").value;
    const parent = document.getElementById("categoryParent").value;

    if (!name) {
      this.showNotification("Please enter category name", "warning");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          parent: parent || undefined,
        }),
      });

      if (response.ok) {
        this.showNotification("✓ Category added");
        document.getElementById("categoryName").value = "";
        document.getElementById("categoryParent").value = "";
        this.loadAdminCategories();
        this.loadCategories();
      }
    } catch (error) {
      this.showNotification("Error adding category", "error");
    }
  },

  // Pagination
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadBooks();
    }
  },

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadBooks();
    }
  },

  // Close Modal
  closeModal() {
    document.getElementById("bookModal").classList.remove("active");
  },

  // View Order Details
  // viewOrderDetails(orderId) {
  //   this.showNotification("Order details coming soon", "warning");
  // },

  // Get Order By ID
  async getOrderById(orderId) {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return data.order || data.data;
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
      return null;
    }
  },

  // View Order Details Modal
  async viewOrderDetails(orderId) {
    try {
      this.showLoader(true);
      const order = await this.getOrderById(orderId);

      if (!order) {
        this.showNotification("Order not found", "error");
        return;
      }

      const orderHTML = this.generateOrderDetailsHTML(order);
      document.getElementById("orderDetailsContent").innerHTML = orderHTML;
      document.getElementById("orderDetailsModal").classList.add("active");
    } catch (error) {
      this.handleError(error);
    } finally {
      this.showLoader(false);
    }
  },

  // Generate Order Details HTML
  generateOrderDetailsHTML(order) {
    const statusOptions = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const isSeller = this.currentUser?.role === "seller";
    const isAdmin = this.currentUser?.role === "admin";
    const canUpdateStatus = isSeller || isAdmin;

    const itemsHTML = (order.items || [])
      .map(
        (item) => `
      <div class="order-item">
        <div class="item-image">
          <img src="${item.book.images}" alt="${item.book?.title || "Book"}">
        </div>
        <div class="item-details">
          <h4>${item.book?.title || "Unknown Book"}</h4>
          <p>Author: ${item.book?.author?.join(", ") || "Unknown"}</p>
          <p>Price: EGP ${item.price}</p>
          <p>Quantity: ${item.quantity}</p>
          <p>Subtotal: EGP ${item.subtotal}</p>
        </div>
      </div>
    `
      )
      .join("");

    const shippingInfo = order.shippingAddress || {};

    return `
      <div class="order-details-wrapper">
        <div class="order-header">
          <div>
            <h2>Order Details</h2>
            <p class="order-id">Order ID: ${order._id}</p>
          </div>
          <div class="order-meta">
            <p class="order-date">Date: ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p class="order-time">Time: ${new Date(
              order.createdAt
            ).toLocaleTimeString()}</p>
          </div>
        </div>

        <div class="order-status-section">
          <h3>Order Status</h3>
          <div class="status-control">
            <span class="current-status status-${
              order.status
            }">${order.status?.toUpperCase()}</span>
            ${
              canUpdateStatus
                ? `
              <div class="status-update">
                <select id="statusSelect" onchange="app.updateOrderStatus('${
                  order._id
                }', this.value)">
                  <option value="">Change Status...</option>
                  ${statusOptions
                    .map(
                      (status) =>
                        `<option value="${status}" ${
                          status === order.status ? "selected" : ""
                        }>${status.toUpperCase()}</option>`
                    )
                    .join("")}
                </select>
              </div>
            `
                : ""
            }
          </div>
        </div>

        <div class="order-items-section">
          <h3>Order Items (${order.items?.length || 0})</h3>
          <div class="order-items">
            ${itemsHTML}
          </div>
        </div>

        <div class="order-info-grid">
          <div class="info-card">
            <h3>Shipping Address</h3>
            <p><strong>Name:</strong> ${shippingInfo.fullname || "N/A"}</p>
            <p><strong>Phone:</strong> ${shippingInfo.phone || "N/A"}</p>
            <p><strong>Address:</strong> ${shippingInfo.address || "N/A"}</p>
            <p><strong>City:</strong> ${shippingInfo.city || "N/A"}</p>
          </div>

          <div class="info-card">
            <h3>Order Summary</h3>
            <p><strong>Subtotal:</strong> EGP ${
              (order.items || []).reduce(
                (sum, item) => sum + (item.subtotal || 0),
                0
              ) || 0
            }</p>
            <p><strong>Shipping:</strong> EGP ${order.shippingCost || 30}</p>
            <p><strong>Total Amount:</strong> EGP ${order.totalAmount}</p>
            <p><strong>Payment Method:</strong> ${
              order.paymentMethod?.toUpperCase() || "N/A"
            }</p>
          </div>

          <div class="info-card">
            <h3>Customer Info</h3>
            <p><strong>Name:</strong> ${
              order.customer?.username || "Unknown"
            }</p>
            <p><strong>Email:</strong> ${order.customer?.email || "N/A"}</p>
            <p><strong>Phone:</strong> ${order.customer?.phone || "N/A"}</p>
          </div>
        </div>
      </div>
    `;
  },

  // Update Order Status
  async updateOrderStatus(orderId, newStatus) {
    if (!newStatus) return;

    try {
      this.showLoader(true);

      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        this.showNotification(
          `Order status updated to ${newStatus.toUpperCase()}`,
          "success"
        );
        // Reload order details
        await this.viewOrderDetails(orderId);
        // Reload orders/sales list
        if (this.currentUser?.role === "seller") {
          await this.loadMySales();
        }
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.showLoader(false);
    }
  },

  // Close Order Details Modal
  closeOrderDetails() {
    document.getElementById("orderDetailsModal").classList.remove("active");
  },

  // Load Profile
  async loadProfile() {
    try {
      this.showLoader(true);

      const response = await fetch(`${API_URL}/users/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.data || data;
        this.currentUser = user;
        this.displayProfile(user);
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.showLoader(false);
    }
  },

  // Display Profile
  displayProfile(user) {
    const profileDisplay = document.getElementById("profileDisplay");
    const profileDisplayName = document.getElementById("profileDisplayName");

    profileDisplayName.textContent = user.username || "N/A";

    profileDisplay.innerHTML = `
      <div class="profile-info">
        <div class="info-item">
          <label>Username</label>
          <value>${user.username || "N/A"}</value>
        </div>
        <div class="info-item">
          <label>Email</label>
          <value>${user.email || "N/A"}</value>
        </div>
        <div class="info-item">
          <label>Phone</label>
          <value>${user.phone || "N/A"}</value>
        </div>
        <div class="info-item">
          <label>Role</label>
          <value>${
            user.role
              ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
              : "USER"
          }</value>
        </div>
        <div class="info-item">
          <label>Member Since</label>
          <value>${new Date(user.createdAt).toLocaleDateString()} </value>
        </div>
        <div class="info-item">
          <label>Member For</label>
          <value>${Math.floor(
            (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
          )} days</value>
        </div>
      </div>
    `;

    // Populate edit form
    document.getElementById("profileUsername").value = user.username || "";
    document.getElementById("profileEmail").value = user.email || "";
    document.getElementById("profilePhone").value = user.phone || "";
  },

  // Handle Update Profile
  async handleUpdateProfile(event) {
    event.preventDefault();

    const updatedUser = {
      username: document.getElementById("profileUsername").value,
      email: document.getElementById("profileEmail").value,
      phone: document.getElementById("profilePhone").value,
    };

    try {
      this.showLoader(true);

      const response = await fetch(`${API_URL}/users/auth/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.data || data;
        this.currentUser = user;
        this.updateUserUI();
        this.displayProfile(user);
        document.getElementById("profileError").classList.remove("show");
        this.showNotification("✓ Profile updated successfully", "success");
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error, "profileError");
    } finally {
      this.showLoader(false);
    }
  },

  // Switch Profile Tabs
  switchProfileTab(tabName) {
    const tabs = document.querySelectorAll(".profile-tab-content");
    const buttons = document.querySelectorAll(".profile-tabs .tab-btn");

    tabs.forEach((tab) => tab.classList.remove("active"));
    buttons.forEach((btn) => btn.classList.remove("active"));

    if (tabName === "info") {
      document.getElementById("profileInfoTab").classList.add("active");
      buttons[0].classList.add("active");
    } else if (tabName === "orders") {
      document.getElementById("profileOrdersTab").classList.add("active");
      buttons[1].classList.add("active");
      this.loadUserOrders();
    }
  },

  // Load User Orders
  async loadUserOrders() {
    try {
      this.showLoader(true);
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const orders = Array.isArray(data.data) ? data.data : data.orders || [];
        this.displayUserOrders(orders);
      } else {
        const errorMsg = await this.extractErrorMessage(response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.showLoader(false);
    }
  },

  // Display User Orders
  displayUserOrders(orders) {
    const ordersList = document.getElementById("userOrdersList");

    if (!orders || orders.length === 0) {
      ordersList.innerHTML =
        '<div class="empty-state"><p>📦 No orders yet</p></div>';
      return;
    }

    let ordersHTML = '<div class="orders-container">';

    orders.forEach((order) => {
      const statusColor =
        order.status === "pending"
          ? "#ed8936"
          : order.status === "shipped"
          ? "#4299e1"
          : order.status === "delivered"
          ? "#48bb78"
          : "#a0aec0";

      const totalAmount = order.items.reduce(
        (sum, item) => sum + (item.subtotal || item.price * item.quantity),
        0
      );

      ordersHTML += `
        <div class="order-card">
          <div class="order-header">
            <div class="order-id-section">
              <h4>Order #${order._id.substring(0, 8).toUpperCase()}</h4>
              <p class="order-date">${new Date(
                order.createdAt
              ).toLocaleDateString()}</p>
            </div>
            <div class="order-status-badge" style="background-color: ${statusColor}">
              ${order.status.toUpperCase()}
            </div>
          </div>
          
          <div class="order-items-summary">
            ${order.items
              .map(
                (item) => `
              <div class="order-item-row">
                <span>${item.book?.title || "Book"}</span>
                <span>${item.quantity} x EGP ${item.price}</span>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="order-footer">
            <div class="order-total">
              <strong>Total: EGP ${totalAmount.toFixed(2)}</strong>
            </div>
            <button class="view-details-btn" onclick="app.viewOrderDetails('${
              order._id
            }')">
              View Details →
            </button>
          </div>
        </div>
      `;
    });

    ordersHTML += "</div>";
    ordersList.innerHTML = ordersHTML;
  },
};

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
