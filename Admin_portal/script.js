// Sample data
const customers = [
  {
    id: "CUST001",
    name: "John Doe",
    phone: "+91 9876543210",
    email: "john.doe@email.com",
    location: "Mumbai, Maharashtra",
    registeredProducts: 3,
    activeJobs: 1,
    status: "Active",
  },
  {
    id: "CUST002",
    name: "Jane Smith",
    phone: "+91 9876543211",
    email: "jane.smith@email.com",
    location: "Delhi, Delhi",
    registeredProducts: 2,
    activeJobs: 0,
    status: "Active",
  },
  {
    id: "CUST003",
    name: "Mike Wilson",
    phone: "+91 9876543212",
    email: "mike.wilson@email.com",
    location: "Bangalore, Karnataka",
    registeredProducts: 5,
    activeJobs: 2,
    status: "Active",
  },
]

const tasks = [
  {
    id: "JOB001",
    customer: "John Doe",
    product: "iPhone 14",
    issue: "Screen replacement",
    priority: "High",
    status: "unassigned",
    createdDate: "2024-01-15",
    location: "Mumbai",
    estimatedTime: "2 hours",
  },
  {
    id: "JOB002",
    customer: "Jane Smith",
    product: "HP Laptop",
    issue: "Battery replacement",
    priority: "Medium",
    status: "pending",
    createdDate: "2024-01-16",
    location: "Delhi",
    estimatedTime: "3 hours",
  },
  {
    id: "JOB003",
    customer: "Mike Wilson",
    product: "Samsung TV",
    issue: "Display issue",
    priority: "Low",
    status: "repair",
    createdDate: "2024-01-17",
    location: "Bangalore",
    estimatedTime: "4 hours",
  },
  {
    id: "JOB004",
    customer: "Sarah Johnson",
    product: "MacBook Pro",
    issue: "Keyboard replacement",
    priority: "High",
    status: "complete",
    createdDate: "2024-01-18",
    location: "Chennai",
    estimatedTime: "1.5 hours",
  },
  {
    id: "JOB005",
    customer: "David Brown",
    product: "iPad",
    issue: "Water damage",
    priority: "Medium",
    status: "cancelled",
    createdDate: "2024-01-19",
    location: "Pune",
    estimatedTime: "3 hours",
  },
]

const complaints = [
  {
    id: "COMP001",
    customer: "John Doe",
    phone: "+91 9876543210",
    product: "iPhone 14",
    issue: "Screen not responding",
    priority: "High",
    status: "Open",
    assignedTo: null,
    createdDate: "2024-01-15",
    location: "Mumbai, Maharashtra",
  },
  {
    id: "COMP002",
    customer: "Jane Smith",
    phone: "+91 9876543211",
    product: "HP Laptop",
    issue: "Battery draining fast",
    priority: "Medium",
    status: "Assigned",
    assignedTo: "Engineer A",
    createdDate: "2024-01-16",
    location: "Delhi, Delhi",
  },
  {
    id: "COMP003",
    customer: "Mike Wilson",
    phone: "+91 9876543212",
    product: "Samsung TV",
    issue: "No display",
    priority: "High",
    status: "In Progress",
    assignedTo: "Engineer B",
    createdDate: "2024-01-17",
    location: "Bangalore, Karnataka",
  },
]

const engineers = [
  {
    id: "ENG001",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@vsat.com",
    phone: "+91 9876543210",
    specialization: "Mobile Devices",
    location: "Mumbai, Maharashtra",
    status: "Available",
    rating: 4.8,
    activeJobs: 3,
    completedJobs: 156,
    joinDate: "2022-01-15",
  },
  {
    id: "ENG002",
    name: "Priya Sharma",
    email: "priya.sharma@vsat.com",
    phone: "+91 9876543211",
    specialization: "Electronics",
    location: "Delhi, Delhi",
    status: "Busy",
    rating: 4.9,
    activeJobs: 5,
    completedJobs: 203,
    joinDate: "2021-08-20",
  },
  {
    id: "ENG003",
    name: "Amit Patel",
    email: "amit.patel@vsat.com",
    phone: "+91 9876543212",
    specialization: "Computers",
    location: "Bangalore, Karnataka",
    status: "Available",
    rating: 4.7,
    activeJobs: 2,
    completedJobs: 134,
    joinDate: "2022-03-10",
  },
  {
    id: "ENG004",
    name: "Sneha Reddy",
    email: "sneha.reddy@vsat.com",
    phone: "+91 9876543213",
    specialization: "Home Appliances",
    location: "Chennai, Tamil Nadu",
    status: "On Leave",
    rating: 4.6,
    activeJobs: 0,
    completedJobs: 89,
    joinDate: "2023-01-05",
  },
]

// Global variables
let currentSection = "dashboard"
let currentTaskStatus = "unassigned"
let filteredCustomers = [...customers]
let filteredTasks = [...tasks]
let filteredComplaints = [...complaints]
let filteredEngineers = [...engineers]

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

// Initialize Application
function initializeApp() {
  setupEventListeners()
  showSection("dashboard")
  renderCustomerResults()
  renderTaskList()
  renderComplaintsTable()
  renderEngineerList()
  updateTaskStatusCounts()
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const section = this.getAttribute("data-section")
      showSection(section)
      setActiveNavItem(this)
    })
  })

  // Sidebar toggle
  const sidebarToggle = document.querySelector(".sidebar-toggle")
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar)
  }

  // Status cards
  const statusCards = document.querySelectorAll(".status-card")
  statusCards.forEach((card) => {
    card.addEventListener("click", function () {
      const status = this.getAttribute("data-status")
      setActiveStatusCard(this)
      currentTaskStatus = status
      renderTaskList()
    })
  })

  // Search inputs
  const customerSearchInput = document.getElementById("customer-search-input")
  if (customerSearchInput) {
    customerSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchCustomers()
      }
    })
  }

  const complaintSearch = document.getElementById("complaint-search")
  if (complaintSearch) {
    complaintSearch.addEventListener("input", function () {
      searchComplaints(this.value)
    })
  }

  const engineerSearch = document.getElementById("engineer-search")
  if (engineerSearch) {
    engineerSearch.addEventListener("input", function () {
      searchEngineers(this.value)
    })
  }
}

// Navigation Functions
function showSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll(".section")
  sections.forEach((section) => {
    section.classList.remove("active")
  })

  // Show selected section
  const targetSection = document.getElementById(sectionId)
  if (targetSection) {
    targetSection.classList.add("active")
    currentSection = sectionId
  }
}

function setActiveNavItem(activeItem) {
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => {
    item.classList.remove("active")
  })
  activeItem.classList.add("active")
}

function setActiveStatusCard(activeCard) {
  const statusCards = document.querySelectorAll(".status-card")
  statusCards.forEach((card) => {
    card.classList.remove("active")
  })
  activeCard.classList.add("active")
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar")
  sidebar.classList.toggle("open")
}

// Customer Search Functions
function searchCustomers() {
  const searchInput = document.getElementById("customer-search-input")
  const query = searchInput.value.toLowerCase().trim()

  if (!query) {
    filteredCustomers = [...customers]
  } else {
    filteredCustomers = customers.filter(
      (customer) =>
        customer.id.toLowerCase().includes(query) ||
        customer.name.toLowerCase().includes(query) ||
        customer.phone.includes(query),
    )
  }

  renderCustomerResults()
}

function renderCustomerResults() {
  const resultsContainer = document.getElementById("customer-results")
  const resultsCount = document.getElementById("results-count")

  if (!resultsContainer || !resultsCount) return

  resultsCount.textContent = filteredCustomers.length

  resultsContainer.innerHTML = filteredCustomers
    .map(
      (customer) => `
        <div class="customer-card">
            <div class="customer-header">
                <div class="customer-info">
                    <div class="customer-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="customer-details">
                        <h3>${customer.name}</h3>
                        <p class="customer-id">ID: ${customer.id}</p>
                        <div class="customer-contact">
                            <div class="contact-item">
                                <i class="fas fa-phone"></i>
                                ${customer.phone}
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-map-marker-alt"></i>
                                ${customer.location}
                            </div>
                        </div>
                        <p class="contact-item">
                            <i class="fas fa-envelope"></i>
                            ${customer.email}
                        </p>
                    </div>
                </div>
                <div class="customer-stats">
                    <div class="stat-box">
                        <div class="stat-icon">
                            <i class="fas fa-box"></i>
                        </div>
                        <p class="stat-value">${customer.registeredProducts}</p>
                        <p class="stat-label">Products</p>
                    </div>
                    <div class="stat-box">
                        <div class="stat-icon">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <p class="stat-value">${customer.activeJobs}</p>
                        <p class="stat-label">Active Jobs</p>
                    </div>
                </div>
            </div>
            <div class="customer-actions">
                <button class="btn btn-outline">View Profile</button>
                <button class="btn btn-outline">View Products</button>
                <button class="btn btn-primary">Create Job</button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Task Management Functions
function updateTaskStatusCounts() {
  const statusCounts = {
    unassigned: tasks.filter((t) => t.status === "unassigned").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    repair: tasks.filter((t) => t.status === "repair").length,
    complete: tasks.filter((t) => t.status === "complete").length,
    cancelled: tasks.filter((t) => t.status === "cancelled").length,
  }

  Object.keys(statusCounts).forEach((status) => {
    const card = document.querySelector(`[data-status="${status}"] .status-count`)
    if (card) {
      card.textContent = statusCounts[status]
    }
  })
}

function renderTaskList() {
  const taskList = document.getElementById("task-list")
  if (!taskList) return

  filteredTasks = tasks.filter((task) => task.status === currentTaskStatus)

  taskList.innerHTML = filteredTasks
    .map(
      (task) => `
        <div class="task-item">
            <div class="task-content">
                <div class="task-main">
                    <div class="task-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="task-details">
                        <h3>Job #${task.id}</h3>
                        <p class="task-customer">${task.customer}</p>
                        <div class="task-meta">
                            <div class="meta-item">
                                <i class="fas fa-box"></i>
                                <span>${task.product}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${task.location}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-calendar"></i>
                                <span>${task.createdDate}</span>
                            </div>
                        </div>
                        <p class="task-issue">${task.issue}</p>
                        <p class="meta-item">
                            <i class="fas fa-clock"></i>
                            Estimated: ${task.estimatedTime}
                        </p>
                    </div>
                </div>
                <div class="task-badges">
                    <span class="badge badge-${getPriorityColor(task.priority)}">${task.priority}</span>
                    <span class="badge badge-${getStatusColor(task.status)}">${getStatusLabel(task.status)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-outline">View Details</button>
                ${task.status === "unassigned" ? '<button class="btn btn-primary">Assign Engineer</button>' : ""}
                <button class="btn btn-outline">Update Status</button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Complaint Management Functions
function searchComplaints(query) {
  if (!query) {
    filteredComplaints = [...complaints]
  } else {
    filteredComplaints = complaints.filter(
      (complaint) =>
        complaint.id.toLowerCase().includes(query.toLowerCase()) ||
        complaint.customer.toLowerCase().includes(query.toLowerCase()) ||
        complaint.product.toLowerCase().includes(query.toLowerCase()),
    )
  }
  renderComplaintsTable()
}

function renderComplaintsTable() {
  const tbody = document.getElementById("complaints-tbody")
  if (!tbody) return

  tbody.innerHTML = filteredComplaints
    .map(
      (complaint) => `
        <tr>
            <td class="complaint-id">${complaint.id}</td>
            <td class="customer-details">
                <div class="customer-name">${complaint.customer}</div>
                <div class="contact-info">
                    <i class="fas fa-phone"></i>
                    ${complaint.phone}
                </div>
                <div class="contact-info">
                    <i class="fas fa-map-marker-alt"></i>
                    ${complaint.location}
                </div>
            </td>
            <td class="product-info">
                <div class="product-name">${complaint.product}</div>
                <div class="issue-description">${complaint.issue}</div>
                <div class="date-info">
                    <i class="fas fa-calendar"></i>
                    ${complaint.createdDate}
                </div>
            </td>
            <td>
                <span class="badge badge-${getPriorityColor(complaint.priority)}">${complaint.priority}</span>
            </td>
            <td>
                <span class="badge badge-${getStatusColor(complaint.status)}">${complaint.status}</span>
            </td>
            <td>
                ${
                  complaint.assignedTo
                    ? `<div class="assigned-engineer">
                        <i class="fas fa-user"></i>
                        <span>${complaint.assignedTo}</span>
                    </div>`
                    : `<select class="engineer-select" onchange="assignEngineer('${complaint.id}', this.value)">
                        <option value="">Select Engineer</option>
                        ${engineers
                          .filter((e) => e.status === "Available")
                          .map(
                            (engineer) =>
                              `<option value="${engineer.id}">${engineer.name} - ${engineer.specialization}</option>`,
                          )
                          .join("")}
                    </select>`
                }
            </td>
            <td class="table-actions">
                <button class="btn btn-outline">View</button>
                <button class="btn btn-outline">Edit</button>
            </td>
        </tr>
    `,
    )
    .join("")
}

function assignEngineer(complaintId, engineerId) {
  if (!engineerId) return

  const engineer = engineers.find((e) => e.id === engineerId)
  const complaintIndex = complaints.findIndex((c) => c.id === complaintId)

  if (engineer && complaintIndex !== -1) {
    complaints[complaintIndex].assignedTo = engineer.name
    complaints[complaintIndex].status = "Assigned"
    renderComplaintsTable()
    showNotification("Engineer assigned successfully!", "success")
  }
}

// Engineer Management Functions
function searchEngineers(query) {
  if (!query) {
    filteredEngineers = [...engineers]
  } else {
    filteredEngineers = engineers.filter(
      (engineer) =>
        engineer.name.toLowerCase().includes(query.toLowerCase()) ||
        engineer.specialization.toLowerCase().includes(query.toLowerCase()) ||
        engineer.location.toLowerCase().includes(query.toLowerCase()),
    )
  }
  renderEngineerList()
}

function renderEngineerList() {
  const engineerList = document.getElementById("engineer-list")
  if (!engineerList) return

  engineerList.innerHTML = filteredEngineers
    .map(
      (engineer) => `
        <div class="engineer-card">
            <div class="engineer-header">
                <div class="engineer-main">
                    <div class="engineer-avatar">
                        ${engineer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                    </div>
                    <div class="engineer-info">
                        <h3>${engineer.name}</h3>
                        <p class="engineer-id">ID: ${engineer.id}</p>
                        <div class="engineer-contact">
                            <div class="contact-item">
                                <i class="fas fa-envelope"></i>
                                ${engineer.email}
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-phone"></i>
                                ${engineer.phone}
                            </div>
                        </div>
                        <div class="engineer-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${engineer.location}
                        </div>
                        <div class="engineer-specialization">
                            <span class="specialization-badge">${engineer.specialization}</span>
                            <div class="rating">
                                <i class="fas fa-star"></i>
                                <span>${engineer.rating}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="engineer-stats-section">
                    <span class="badge badge-${getStatusColor(engineer.status)}">${engineer.status}</span>
                    <div class="engineer-performance">
                        <div class="performance-item">
                            <span class="performance-value">${engineer.activeJobs}</span>
                            <span class="performance-label">Active Jobs</span>
                        </div>
                        <div class="performance-item">
                            <span class="performance-value">${engineer.completedJobs}</span>
                            <span class="performance-label">Completed</span>
                        </div>
                        <div class="join-date">Since ${engineer.joinDate}</div>
                    </div>
                </div>
            </div>
            <div class="engineer-actions">
                <button class="btn btn-outline">View Profile</button>
                <button class="btn btn-outline">View Jobs</button>
                <button class="btn btn-outline">Assign Job</button>
                <button class="btn btn-outline">Contact</button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Utility Functions
function getPriorityColor(priority) {
  switch (priority.toLowerCase()) {
    case "high":
      return "red"
    case "medium":
      return "yellow"
    case "low":
      return "green"
    default:
      return "gray"
  }
}

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "open":
    case "unassigned":
      return "red"
    case "assigned":
    case "pending":
      return "yellow"
    case "in progress":
    case "repair":
      return "blue"
    case "complete":
    case "resolved":
      return "green"
    case "available":
      return "green"
    case "busy":
      return "yellow"
    case "on leave":
    case "cancelled":
      return "gray"
    default:
      return "gray"
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "unassigned":
      return "Unassigned"
    case "pending":
      return "Pending"
    case "repair":
      return "In Repair"
    case "complete":
      return "Complete"
    case "cancelled":
      return "Cancelled"
    default:
      return status
  }
}

function showNotification(message, type = "success") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#16a34a" : "#dc2626"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `

  document.body.appendChild(notification)

  // Show notification
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
  const sidebar = document.querySelector(".sidebar")
  const sidebarToggle = document.querySelector(".sidebar-toggle")

  if (
    window.innerWidth <= 1024 &&
    !sidebar.contains(e.target) &&
    !sidebarToggle.contains(e.target) &&
    sidebar.classList.contains("open")
  ) {
    sidebar.classList.remove("open")
  }
})

// Handle window resize
window.addEventListener("resize", () => {
  const sidebar = document.querySelector(".sidebar")
  if (window.innerWidth > 1024) {
    sidebar.classList.remove("open")
  }
})
