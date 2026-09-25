// Portal state and placeholder data for the client experience.
const state = {
  services: [],
  requests: [],
  notifications: [],
  payments: [],
  tickets: [],
  documents: [],
};

const defaultServices = [
  {
    id: 1,
    name: "Website Development",
    duration: "4-8 weeks",
    price: "From ₦450,000",
    icon: "bi-globe2",
    description:
      "High-converting web experiences with premium design and performance optimization.",
  },
  {
    id: 2,
    name: "Software Development",
    duration: "6-12 weeks",
    price: "From ₦850,000",
    icon: "bi-code-square",
    description:
      "Custom business software tailored to your internal workflows and growth goals.",
  },
  {
    id: 3,
    name: "Mobile App Development",
    duration: "6-10 weeks",
    price: "From ₦1,200,000",
    icon: "bi-phone",
    description:
      "Modern mobile solutions for Android, iOS, or cross-platform experiences.",
  },
  {
    id: 4,
    name: "Networking",
    duration: "2-5 days",
    price: "From ₦180,000",
    icon: "bi-router",
    description:
      "Secure networking, cabling, and infrastructure upgrades for modern teams.",
  },
  {
    id: 5,
    name: "CCTV Installation",
    duration: "1-3 days",
    price: "From ₦120,000",
    icon: "bi-camera-video",
    description:
      "Reliable surveillance systems designed for offices, homes, and retail sites.",
  },
  {
    id: 6,
    name: "Cloud Solutions",
    duration: "3-7 days",
    price: "From ₦260,000",
    icon: "bi-cloud",
    description:
      "Scalable cloud migration and managed infrastructure for modern organizations.",
  },
  {
    id: 7,
    name: "Cybersecurity",
    duration: "2-6 days",
    price: "From ₦300,000",
    icon: "bi-shield-lock",
    description:
      "Protect your systems with risk reviews, endpoint defense, and compliance planning.",
  },
  {
    id: 8,
    name: "Computer Maintenance",
    duration: "1-2 days",
    price: "From ₦90,000",
    icon: "bi-pc-display",
    description:
      "Proactive maintenance, hardware support, and device optimization.",
  },
  {
    id: 9,
    name: "IT Consulting",
    duration: "2-4 weeks",
    price: "From ₦320,000",
    icon: "bi-people",
    description:
      "Strategic guidance for digital operations, systems, staffing, and transformation.",
  },
  {
    id: 10,
    name: "Graphics Design",
    duration: "3-7 days",
    price: "From ₦85,000",
    icon: "bi-brush",
    description:
      "Brand visuals, presentations, marketing collateral, and UI design assets.",
  },
  {
    id: 11,
    name: "Digital Branding",
    duration: "4-10 days",
    price: "From ₦150,000",
    icon: "bi-palette",
    description:
      "Create a memorable visual identity with positioning and brand systems.",
  },
  {
    id: 12,
    name: "IT Training & Facilitation",
    duration: "2-5 days",
    price: "From ₦140,000",
    icon: "bi-mortarboard",
    description:
      "Hands-on training for teams and leadership across core technology topics.",
  },
];

const defaultRequests = [
  {
    id: "REQ-1001",
    service: "Website Development",
    priority: "High",
    status: "In Progress",
    assignedStaff: "Grace Okafor",
    created: "2026-07-12",
    expected: "2026-07-28",
    progress: 72,
    details: "Design system and frontend build in progress.",
  },
  {
    id: "REQ-1002",
    service: "Cybersecurity",
    priority: "Medium",
    status: "Waiting for Client",
    assignedStaff: "Musa Ibrahim",
    created: "2026-07-08",
    expected: "2026-07-22",
    progress: 46,
    details: "Security review and policy updates pending client feedback.",
  },
  {
    id: "REQ-1003",
    service: "Cloud Solutions",
    priority: "Low",
    status: "Completed",
    assignedStaff: "Ada Oke",
    created: "2026-06-30",
    expected: "2026-07-10",
    progress: 100,
    details: "Deployment completed and handover delivered.",
  },
];

const defaultNotifications = [
  {
    id: 1,
    title: "Invoice generated",
    body: "Invoice #INV-2041 is ready for download.",
    time: "12 mins ago",
    kind: "invoice",
  },
  {
    id: 2,
    title: "Technician assigned",
    body: "Grace Okafor has been assigned to your website project.",
    time: "1 hour ago",
    kind: "service",
  },
  {
    id: 3,
    title: "Service completed",
    body: "Your cloud migration package is now complete.",
    time: "2 hours ago",
    kind: "service",
  },
];

const defaultPayments = [
  {
    id: "INV-2041",
    amount: "₦450,000",
    status: "Outstanding",
    due: "2026-07-25",
  },
  { id: "INV-1998", amount: "₦180,000", status: "Paid", due: "2026-06-18" },
];

const defaultTickets = [
  {
    id: "TKT-118",
    title: "Billing clarification",
    status: "Open",
    priority: "Medium",
  },
  {
    id: "TKT-119",
    title: "Website hosting support",
    status: "Pending",
    priority: "High",
  },
];

const defaultDocuments = [
  { name: "Service agreement.pdf", type: "Contract" },
  { name: "Invoice-2041.pdf", type: "Invoice" },
  { name: "Security report.pdf", type: "Report" },
];

const refs = {
  loaderShell: document.getElementById("loaderShell"),
  themeToggle: document.getElementById("themeToggle"),
  sidebar: document.getElementById("sidebar"),
  sidebarToggle: document.getElementById("sidebarToggle"),
  mobileToggle: document.getElementById("mobileToggle"),
  overlay: document.getElementById("sidebarOverlay"),
  notificationDrawer: document.getElementById("notificationDrawer"),
  notificationsToggle: document.getElementById("notificationsToggle"),
  closeNotifications: document.getElementById("closeNotifications"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  requestModal: document.getElementById("requestModal"),
  closeModal: document.getElementById("closeModal"),
  cancelModal: document.getElementById("cancelModal"),
  requestForm: document.getElementById("requestForm"),
  serviceName: document.getElementById("serviceName"),
  currentDate: document.getElementById("currentDate"),
  toast: document.getElementById("toast"),
  notificationBadge: document.getElementById("notificationBadge"),
  dashboardNotifications: document.getElementById("dashboardNotifications"),
  drawerNotificationList: document.getElementById("drawerNotificationList"),
  servicesGrid: document.getElementById("servicesGrid"),
  requestsTableBody: document.getElementById("requestsTableBody"),
  requestDetailsContent: document.getElementById("requestDetailsContent"),
  outstandingInvoices: document.getElementById("outstandingInvoices"),
  paymentHistory: document.getElementById("paymentHistory"),
  ticketsList: document.getElementById("ticketsList"),
  documentsList: document.getElementById("documentsList"),
  documentsArchive: document.getElementById("documentsArchive"),
  notificationCenterList: document.getElementById("notificationCenterList"),
  supportMessages: document.getElementById("supportMessages"),
  supportForm: document.getElementById("supportForm"),
  supportMessage: document.getElementById("supportMessage"),
  clearNotifications: document.getElementById("clearNotifications"),
  clientLogout: document.getElementById("clientLogout"),
};

let csrfToken = "";
let currentUser = null;

async function portalApi(url, options = {}) {
  if (!csrfToken) {
    const tokenResponse = await fetch("/api/csrf-token");
    csrfToken = (await tokenResponse.json()).csrfToken;
  }
  const isFormData = options.body instanceof FormData;
  const response = await fetch(url, {
    ...options,
    headers: {
      "x-csrf-token": csrfToken,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.message || "Unable to complete this request.");
  return result;
}

function applyUserProfile(user) {
  currentUser = user;
  document.querySelectorAll("[data-user-name]").forEach((element) => {
    element.textContent = user.username;
  });
  document.querySelectorAll("[data-client-tier]").forEach((element) => {
    element.textContent = user.client_tier || "Regular Client";
  });
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.username.value = user.username;
    profileForm.email.value = user.email;
    profileForm.phone.value = user.phone;
  }
  const picture = user.profile_picture || "/images/default-avatar.svg";
  document.getElementById("profilePreview").src = picture;
  document.querySelectorAll("[data-profile-picture]").forEach((image) => {
    image.src = picture;
  });
  document.getElementById("clientName").value = user.username;
  document.getElementById("email").value = user.email;
  document.getElementById("phone").value = user.phone;
}

async function loadAuthenticatedUser() {
  try {
    const { user } = await portalApi("/api/user/profile");
    if (user.role !== "client") {
      window.location.replace("/admin-dashboard.html");
      return;
    }
    applyUserProfile(user);
    await loadClientWork();
  } catch (error) {
    window.location.replace("/login.html");
  }
}

async function loadClientWork() {
  const [requestData, notificationData, invoiceData, supportData] = await Promise.all([
    portalApi("/api/user/requests"),
    portalApi("/api/user/notifications"),
    portalApi("/api/user/invoices"),
    portalApi("/api/user/support/messages"),
  ]);
  state.requests = requestData.requests.map((request) => ({
    id: `REQ-${request.id}`,
    service: request.service,
    priority: "Standard",
    status: request.status.replace("_", " "),
    assignedStaff: "Assigned by AJ Tech",
    created: request.created_at,
    expected: request.due_date || "TBD",
    progress: Number.isInteger(request.progress)
      ? request.progress
      : request.status === "completed" ? 100 : 0,
    details: request.admin_note || request.details || "",
  }));
  state.notifications = notificationData.notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    time: new Date(notification.created_at).toLocaleString(),
    kind: notification.kind,
  }));
  state.payments = invoiceData.invoices.map((invoice) => ({
    id: invoice.invoice_number,
    amount: invoice.amount,
    status: invoice.status,
    due: invoice.due_date || "TBD",
  }));
  state.supportMessages = supportData.messages;
}

async function saveProfile(event) {
  event.preventDefault();
  try {
    const result = await portalApi("/api/user/profile", {
      method: "PUT",
      body: new FormData(event.currentTarget),
    });
    const { user } = await portalApi("/api/user/profile");
    applyUserProfile(user);
    showToast(result.message || "Profile updated successfully.");
  } catch (error) {
    showToast(error.message);
  }
}

function loadState() {
  state.services = defaultServices;
  state.requests = [];
  state.notifications = [];
  state.payments = [];
  state.tickets = [];
  state.documents = [];
}

function saveState() {
  // Account data is loaded from the authenticated API; never seed demo records.
}

function toggleLoader(show) {
  refs.loaderShell.classList.toggle("hidden", !show);
}

function updateDate() {
  const date = new Date();
  refs.currentDate.textContent = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = theme === "light" ? "bi-moon" : "bi-sun";
  refs.themeToggle.innerHTML = `<i class="bi ${icon}"></i>`;
  localStorage.setItem("ajTheme", theme);
}

function toggleSidebar(force) {
  const isOpen =
    typeof force === "boolean"
      ? force
      : !refs.sidebar.classList.contains("open");
  refs.sidebar.classList.toggle("open", isOpen);
  refs.overlay.classList.toggle("open", isOpen);
}

function openModal() {
  refs.modalBackdrop.classList.add("open");
  refs.requestModal.classList.add("open");
  document.getElementById("serviceName").focus();
}

function closeModal() {
  refs.modalBackdrop.classList.remove("open");
  refs.requestModal.classList.remove("open");
  refs.requestForm.reset();
}

function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => refs.toast.classList.remove("show"), 3200);
}

function animateCounters() {
  const counts = {
    "active-services": state.requests.filter((request) => ["approved", "in progress"].includes(request.status.toLowerCase())).length,
    "pending-requests": state.requests.filter((request) => ["pending review", "approved", "in progress"].includes(request.status.toLowerCase())).length,
    "completed-requests": state.requests.filter((request) => request.status.toLowerCase() === "completed").length,
    "open-tickets": state.tickets.filter((ticket) => ticket.status.toLowerCase() === "open").length,
  };
  document.querySelectorAll("[data-metric]").forEach((item) => {
    item.textContent = String(counts[item.dataset.metric] || 0);
  });
}

function renderNotifications() {
  const items = state.notifications.slice(0, 4);
  refs.dashboardNotifications.innerHTML = items
    .map(
      (item) => `
    <li class="notification-item">
      <div class="avatar"><i class="bi bi-bell"></i></div>
      <div>
        <strong>${item.title}</strong>
        <p>${item.body}</p>
        <p>${item.time}</p>
      </div>
    </li>
  `,
    )
    .join("") || '<li class="notification-item"><div><strong>No notifications yet</strong><p>Updates from AJ Tech will appear here.</p></div></li>';
  refs.drawerNotificationList.innerHTML = state.notifications
    .map(
      (item) => `
    <div class="notification-item">
      <div class="avatar"><i class="bi bi-bell"></i></div>
      <div>
        <strong>${item.title}</strong>
        <p>${item.body}</p>
        <p>${item.time}</p>
      </div>
    </div>
  `,
    )
    .join("") || '<div class="notification-item"><div><strong>No notifications yet</strong><p>Updates from AJ Tech will appear here.</p></div></div>';
  refs.notificationBadge.textContent = state.notifications.length;
}

function renderServices() {
  refs.servicesGrid.innerHTML = state.services
    .map(
      (service) => `
    <article class="service-card">
      <div class="service-icon"><i class="bi ${service.icon}"></i></div>
      <h3>${service.name}</h3>
      <p>${service.description}</p>
      <div class="service-meta">
        <span>${service.duration}</span>
        <strong>${service.price}</strong>
      </div>
      <button class="btn btn-primary" type="button" data-service-name="${service.name}">Request Service</button>
    </article>
  `,
    )
    .join("");
}

function renderRequests() {
  const search =
    document.getElementById("requestSearch")?.value?.toLowerCase() || "";
  const filtered = state.requests.filter((request) => {
    return [request.id, request.service, request.status, request.assignedStaff]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  refs.requestsTableBody.innerHTML = filtered
    .map(
      (request) => `
    <tr>
      <td>${request.id}</td>
      <td>${request.service}</td>
      <td>${request.priority}</td>
      <td><span class="badge ${request.status.toLowerCase().replace(/\s+/g, "-")}">${request.status}</span></td>
      <td>${request.assignedStaff}</td>
      <td>${request.created}</td>
      <td>${request.expected}</td>
      <td><button class="text-btn" data-request-id="${request.id}" type="button">View details</button></td>
    </tr>
  `,
    )
    .join("") || '<tr><td colspan="8">No service requests yet.</td></tr>';

  const firstRequest = filtered[0] || state.requests[0];
  if (firstRequest) {
    refs.requestDetailsContent.innerHTML = `
      <div class="detail-card">
        <div class="detail-grid">
          <div><span>Service</span><strong>${firstRequest.service}</strong></div>
          <div><span>Assigned staff</span><strong>${firstRequest.assignedStaff}</strong></div>
          <div><span>Status</span><strong>${firstRequest.status}</strong></div>
          <div><span>Completion</span><strong>${firstRequest.progress}%</strong></div>
        </div>
        <div class="progress-bar"><i style="width:${firstRequest.progress}%"></i></div>
        <p>${firstRequest.details}</p>
        <div class="timeline">
          <div class="timeline-item"><span class="timeline-dot"></span><div><strong>Request submitted</strong><p>${firstRequest.created}</p></div></div>
          <div class="timeline-item"><span class="timeline-dot"></span><div><strong>Admin reviewed</strong><p>Ready for assignment</p></div></div>
          <div class="timeline-item"><span class="timeline-dot"></span><div><strong>Work in progress</strong><p>${firstRequest.assignedStaff} is actively delivering</p></div></div>
          <div class="timeline-item"><span class="timeline-dot"></span><div><strong>Testing and delivery</strong><p>Pending final handoff</p></div></div>
        </div>
      </div>
    `;
  } else refs.requestDetailsContent.innerHTML = '<p>No request selected.</p>';
}

function renderPayments() {
  refs.outstandingInvoices.innerHTML = state.payments
    .map(
      (payment) => `
    <div class="notification-item">
      <div class="avatar"><i class="bi bi-receipt"></i></div>
      <div>
        <strong>${payment.id}</strong>
        <p>Amount: ${payment.amount}</p>
        <p>Status: ${payment.status}</p>
        <p>Due: ${payment.due}</p>
      </div>
    </div>
  `,
    )
    .join("") || '<p>No invoices available yet.</p>';

  refs.paymentHistory.innerHTML = state.payments
    .map(
      (payment) => `
    <div class="setting-row">
      <span>${payment.id}</span>
      <span class="chip ${payment.status === "Paid" ? "chip-success" : ""}">${payment.status}</span>
    </div>
  `,
    )
    .join("") || '<p>No payment history yet.</p>';
}

function renderTickets() {
  refs.ticketsList.innerHTML = state.tickets
    .map(
      (ticket) => `
    <div class="notification-item">
      <div class="avatar"><i class="bi bi-ticket"></i></div>
      <div>
        <strong>${ticket.title}</strong>
        <p>${ticket.id}</p>
        <p>${ticket.priority} • ${ticket.status}</p>
      </div>
    </div>
  `,
    )
    .join("") || '<p>No support tickets yet.</p>';
}

function renderDocuments() {
  const items = state.documents
    .map(
      (doc) => `
    <div class="setting-row">
      <span>${doc.name}</span>
      <span class="chip">${doc.type}</span>
    </div>
  `,
    )
    .join("");
  refs.documentsList.innerHTML = items || '<p>No documents available yet.</p>';
  refs.documentsArchive.innerHTML = items || '<p>No documents available yet.</p>';
}

function renderNotificationCenter() {
  refs.notificationCenterList.innerHTML = state.notifications
    .map(
      (item) => `
    <div class="notification-item">
      <div class="avatar"><i class="bi bi-bell"></i></div>
      <div>
        <strong>${item.title}</strong>
        <p>${item.body}</p>
        <p>${item.time}</p>
      </div>
    </div>
  `,
    )
    .join("") || '<p>No notifications yet.</p>';
}

function renderSupportMessages() {
  refs.supportMessages.innerHTML = (state.supportMessages || [])
    .map((message) => {
      const outbound = message.sender_id === currentUser.id;
      return `<div class="chat-message ${outbound ? "outbound" : "inbound"}">${String(message.body).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char])}</div>`;
    })
    .join("") || '<p>No messages yet. Start a conversation with support.</p>';
  refs.supportMessages.scrollTop = refs.supportMessages.scrollHeight;
}

function renderActivityTimeline() {
  const timeline = document.getElementById("activityTimeline");
  if (timeline) {
    const items = state.requests.slice(0, 4).map((request) => ({
      title: `Service request: ${request.service}`,
      text: `${request.status} · ${new Date(request.created).toLocaleString()}`,
    }));
    timeline.innerHTML = items
      .map(
        (item) => `
      <div class="timeline-item"><span class="timeline-dot"></span><div><strong>${item.title}</strong><p>${item.text}</p></div></div>
    `,
      )
      .join("") || '<p>No activity yet. Your service updates will appear here.</p>';
  }
}

// Render all portal sections from the shared state.
function renderAll() {
  renderServices();
  renderRequests();
  renderNotifications();
  renderPayments();
  renderTickets();
  renderDocuments();
  renderNotificationCenter();
  renderSupportMessages();
  renderActivityTimeline();
  animateCounters();
}

function openPage(page) {
  document
    .querySelectorAll(".page")
    .forEach((section) =>
      section.classList.toggle("active", section.id === `page-${page}`),
    );
  document
    .querySelectorAll(".nav-link")
    .forEach((button) =>
      button.classList.toggle("active", button.dataset.page === page),
    );
  const safePage = page || "dashboard";
  history.pushState({}, "", `#${safePage}`);
}

function initializeChart() {
  const ctx = document.getElementById("progressChart");
  if (!ctx || typeof Chart === "undefined") return;
  const chartRequests = state.requests.slice(0, 7);
  new Chart(ctx, {
    type: "line",
    data: {
      labels: chartRequests.map((request) => request.service),
      datasets: [
        {
          label: "Service progress",
          data: chartRequests.map((request) => request.progress),
          borderColor: "#4c7dff",
          backgroundColor: "rgba(76,125,255,0.16)",
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

// Submit a service request and notify the client plus admin feed.
async function submitRequest(event) {
  event.preventDefault();
  const formData = new FormData(refs.requestForm);
  const payload = Object.fromEntries(formData.entries());
  payload.serviceName = refs.serviceName.value.trim();
  payload.clientName = payload.clientName || "John Doe";
  payload.email = payload.email || "john@bluepeaklabs.com";
  payload.phone = payload.phone || "+234 806 123 4567";
  payload.companyName = payload.companyName || "BluePeak Labs";
  payload.description = payload.description || "Portal request";
  payload.additionalNotes = payload.additionalNotes || "No extra notes.";
  payload.documents =
    Array.from(formData.getAll("documents"))
      .map((file) => file.name)
      .join(", ") || "No upload";

  try {
    const response = await fetch("/api/service-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (result.success) {
      const request = {
        id: result.request.id,
        service: payload.serviceName,
        priority: payload.priority,
        status: "New",
        assignedStaff: "Pending assignment",
        created: "Just now",
        expected: payload.preferredStartDate || "TBD",
        progress: 10,
        details: payload.description,
      };
      state.requests.unshift(request);
      state.notifications.unshift({
        id: Date.now(),
        title: "New service request",
        body: `${payload.clientName} requested ${payload.serviceName}.`,
        time: "Just now",
        kind: "service",
      });
      saveState();
      renderAll();
      closeModal();
      showToast("Your request has been submitted successfully.");
    } else {
      throw new Error(result.message || "Unable to submit request");
    }
  } catch (error) {
    state.requests.unshift({
      id: `REQ-${Date.now().toString().slice(-4)}`,
      service: payload.serviceName,
      priority: payload.priority,
      status: "New",
      assignedStaff: "Pending assignment",
      created: "Just now",
      expected: payload.preferredStartDate || "TBD",
      progress: 10,
      details: payload.description,
    });
    state.notifications.unshift({
      id: Date.now(),
      title: "New service request",
      body: `${payload.clientName} requested ${payload.serviceName}.`,
      time: "Just now",
      kind: "service",
    });
    saveState();
    renderAll();
    closeModal();
    showToast(
      error.message ||
        "Request saved locally and will sync when the server is available.",
    );
  }
}

async function submitSecureRequest(event) {
  event.preventDefault();
  try {
    const result = await portalApi("/api/user/requests", {
      method: "POST",
      body: JSON.stringify({
        service: refs.serviceName.value.trim(),
        details: document.getElementById("description").value.trim(),
      }),
    });
    await loadClientWork();
    renderAll();
    closeModal();
    showToast(result.message);
  } catch (error) {
    showToast(error.message);
  }
}

// Wire up interactions for navigation, theming, and request submission.
function initializeEvents() {
  refs.themeToggle.addEventListener("click", () =>
    applyTheme(localStorage.getItem("ajTheme") === "light" ? "dark" : "light"),
  );
  refs.sidebarToggle.addEventListener("click", () => toggleSidebar());
  refs.mobileToggle.addEventListener("click", () => toggleSidebar(true));
  refs.overlay.addEventListener("click", () => toggleSidebar(false));
  refs.notificationsToggle.addEventListener("click", () =>
    refs.notificationDrawer.classList.toggle("open"),
  );
  refs.closeNotifications.addEventListener("click", () =>
    refs.notificationDrawer.classList.remove("open"),
  );
  refs.closeModal.addEventListener("click", closeModal);
  refs.cancelModal.addEventListener("click", closeModal);
  refs.modalBackdrop.addEventListener("click", closeModal);
  refs.requestForm.addEventListener("submit", submitSecureRequest);
  refs.clearNotifications.addEventListener("click", async () => {
    if (!state.notifications.length || !confirm("Clear all notifications?")) return;
    try {
      await portalApi("/api/user/notifications", { method: "DELETE" });
      state.notifications = [];
      renderNotifications();
      renderNotificationCenter();
      showToast("Notifications cleared.");
    } catch (error) { showToast(error.message); }
  });
  refs.supportForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const result = await portalApi("/api/user/support/messages", {
        method: "POST", body: JSON.stringify({ body: refs.supportMessage.value }),
      });
      refs.supportForm.reset();
      await loadClientWork();
      renderSupportMessages();
      showToast(result.message);
    } catch (error) { showToast(error.message); }
  });
  refs.clientLogout.addEventListener("click", async () => {
    try {
      await portalApi("/api/auth/logout", { method: "POST" });
    } catch (error) {
      // Continue to sign-in even if the session has already expired.
    }
    window.location.replace("/login.html");
  });
  document
    .getElementById("profileForm")
    .addEventListener("submit", saveProfile);
  document
    .getElementById("profilePicture")
    .addEventListener("change", (event) => {
      const image = event.target.files[0];
      if (image)
        document.getElementById("profilePreview").src =
          URL.createObjectURL(image);
    });
  document.getElementById("quickProfilePicture").addEventListener("click", () => {
    openPage("profile");
    document.getElementById("profilePicture").click();
  });
  document
    .querySelectorAll("[data-open-service-modal]")
    .forEach((button) => button.addEventListener("click", openModal));
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-service-name]");
    if (!button) return;
    refs.serviceName.value = button.dataset.serviceName;
    openModal();
  });
  document
    .getElementById("viewAllNotifications")
    .addEventListener("click", () => {
      openPage("notifications");
      refs.notificationDrawer.classList.remove("open");
    });
  document
    .getElementById("downloadInvoiceHero")
    .addEventListener("click", () =>
      showToast("Invoice download will be ready soon."),
    );
  document
    .getElementById("requestServiceHero")
    .addEventListener("click", openModal);
  document
    .getElementById("requestSearch")
    .addEventListener("input", renderRequests);
  document.querySelectorAll(".nav-link[data-page]").forEach((button) => {
    button.addEventListener("click", () => openPage(button.dataset.page));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      refs.notificationDrawer.classList.remove("open");
      closeModal();
      toggleSidebar(false);
    }
  });

  window.addEventListener("hashchange", () => {
    const page = location.hash.replace("#", "") || "dashboard";
    openPage(page);
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-request-id]");
    if (target) {
      const request = state.requests.find(
        (item) => item.id === target.dataset.requestId,
      );
      if (request) {
        refs.requestDetailsContent.innerHTML = `
          <div class="detail-card">
            <div class="detail-grid">
              <div><span>Request ID</span><strong>${request.id}</strong></div>
              <div><span>Priority</span><strong>${request.priority}</strong></div>
              <div><span>Status</span><strong>${request.status}</strong></div>
              <div><span>Assigned staff</span><strong>${request.assignedStaff}</strong></div>
            </div>
            <p>${request.details}</p>
            <div class="progress-bar"><i style="width:${request.progress}%"></i></div>
          </div>
        `;
        showToast(`Viewing ${request.id}`);
      }
    }
  });
}

async function bootstrap() {
  loadState();
  updateDate();
  const savedTheme = localStorage.getItem("ajTheme") || "dark";
  applyTheme(savedTheme);
  await loadAuthenticatedUser();
  initializeEvents();
  renderAll();
  initializeChart();
  setTimeout(() => {
    toggleLoader(false);
    const page = location.hash.replace("#", "") || "dashboard";
    openPage(page);
  }, 650);
}

document.addEventListener("DOMContentLoaded", bootstrap);
