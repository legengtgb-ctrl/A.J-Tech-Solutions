const { all, get, run } = require("../config/database");

const notify = (userId, title, body, kind = "general") =>
  run("INSERT INTO notifications(user_id,title,body,kind) VALUES(?,?,?,?)", [
    userId,
    title,
    body,
    kind,
  ]);

exports.users = async (req, res) =>
  res.json({
    users: await all(
      "SELECT id,full_name,username,email,phone,role,client_tier,account_status,created_at,last_login FROM users WHERE role != 'super_admin' ORDER BY created_at DESC",
    ),
  });

exports.updateUser = async (req, res) => {
  const { role, accountStatus, clientTier } = req.body;
  if (role && !["admin", "client"].includes(role))
    return res.status(400).json({ message: "Invalid role." });
  if (accountStatus && !["active", "inactive"].includes(accountStatus))
    return res.status(400).json({ message: "Invalid status." });
  if (clientTier && !["Premium Client", "Standard Client", "Regular Client"].includes(clientTier))
    return res.status(400).json({ message: "Invalid client tier." });
  if (clientTier) {
    const user = await get("SELECT role FROM users WHERE id=?", [req.params.id]);
    if (!user || user.role !== "client")
      return res.status(400).json({ message: "Client tiers can only be assigned to client accounts." });
  }
  await run(
    "UPDATE users SET role=COALESCE(?,role),account_status=COALESCE(?,account_status),client_tier=COALESCE(?,client_tier) WHERE id=?",
    [role || null, accountStatus || null, clientTier || null, req.params.id],
  );
  res.json({ message: "User updated." });
};

exports.deleteUser = async (req, res) => {
  if (+req.params.id === req.user.id)
    return res
      .status(400)
      .json({ message: "You cannot delete your own account." });
  await run("DELETE FROM users WHERE id=?", [req.params.id]);
  res.json({ message: "User deleted." });
};

exports.requests = async (req, res) =>
  res.json({
    requests: await all(
      `SELECT r.*, u.full_name, u.email, u.phone, assignee.full_name AS assigned_name
       FROM service_requests r
       JOIN users u ON r.user_id=u.id
       LEFT JOIN users assignee ON r.assigned_to=assignee.id
       ORDER BY CASE WHEN r.status='pending_review' THEN 0 ELSE 1 END, r.created_at DESC`,
    ),
  });

exports.reviewRequest = async (req, res) => {
  const {
    status,
    adminNote = "",
    assignedTo = null,
    estimatedCost = null,
    dueDate = null,
    progress = null,
  } = req.body;
  if (!["approved", "rejected", "in_progress", "completed"].includes(status)) {
    return res.status(400).json({ message: "Choose a valid request action." });
  }
  const request = await get("SELECT * FROM service_requests WHERE id=?", [
    req.params.id,
  ]);
  if (!request) return res.status(404).json({ message: "Request not found." });
  if (progress !== null && (!Number.isInteger(progress) || progress < 0 || progress > 100))
    return res.status(400).json({ message: "Progress must be a whole number from 0 to 100." });
  await run(
    `UPDATE service_requests
     SET status=?, admin_note=?, assigned_to=?, estimated_cost=?, due_date=?, progress=COALESCE(?,progress), reviewed_by=?, reviewed_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`,
    [
      status,
      adminNote,
      assignedTo || null,
      estimatedCost,
      dueDate,
      progress,
      req.user.id,
      request.id,
    ],
  );
  const title =
    status === "approved"
      ? "Service request approved"
      : status === "rejected"
        ? "Service request update"
        : "Service request progress updated";
  const body =
    status === "approved"
      ? `Your ${request.service} request has been approved.${adminNote ? ` Note: ${adminNote}` : ""}`
      : status === "rejected"
        ? `Your ${request.service} request was not approved.${adminNote ? ` Note: ${adminNote}` : ""}`
        : `Your ${request.service} request is now marked ${status.replace("_", " ")}.${adminNote ? ` Note: ${adminNote}` : ""}`;
  await notify(request.user_id, title, body, "request");
  await run(
    "INSERT INTO activity_logs(user_id,action,ip_address) VALUES(?,?,?)",
    [req.user.id, `Updated request #${request.id} to ${status}`, req.ip],
  );
  res.json({
    message: `Request ${status.replace("_", " ")} and client notified.`,
  });
};

exports.supportConversations = async (req, res) =>
  res.json({
    conversations: await all(
      `SELECT m.client_id, u.full_name, u.email, MAX(m.created_at) AS last_message_at,
       (SELECT body FROM support_messages latest WHERE latest.client_id=m.client_id ORDER BY latest.created_at DESC, latest.id DESC LIMIT 1) AS last_message
       FROM support_messages m JOIN users u ON u.id=m.client_id
       GROUP BY m.client_id ORDER BY last_message_at DESC`,
    ),
  });
exports.conversationMessages = async (req, res) =>
  res.json({
    messages: await all(
      `SELECT m.*, u.full_name AS sender_name, u.role AS sender_role
       FROM support_messages m JOIN users u ON u.id=m.sender_id
       WHERE m.client_id=? ORDER BY m.created_at ASC`,
      [req.params.clientId],
    ),
  });
exports.sendSupportMessage = async (req, res) => {
  const body = String(req.body.body || "").trim();
  const client = await get("SELECT id FROM users WHERE id=? AND role='client'", [req.params.clientId]);
  if (!client) return res.status(404).json({ message: "Client not found." });
  if (!body || body.length > 2000)
    return res.status(400).json({ message: "Enter a message of up to 2,000 characters." });
  await run("INSERT INTO support_messages(client_id,sender_id,body) VALUES(?,?,?)", [client.id, req.user.id, body]);
  await notify(client.id, "New support reply", body, "support");
  res.status(201).json({ message: "Reply sent." });
};

exports.invoices = async (req, res) =>
  res.json({
    invoices: await all(
      `SELECT i.*, r.service, u.full_name, u.email
       FROM invoices i JOIN users u ON i.user_id=u.id JOIN service_requests r ON i.request_id=r.id
       ORDER BY i.created_at DESC`,
    ),
  });

exports.createInvoice = async (req, res) => {
  const {
    requestId,
    amount,
    dueDate = null,
    notes = "",
    status = "sent",
  } = req.body;
  if (!requestId || !amount)
    return res
      .status(400)
      .json({ message: "Request and invoice amount are required." });
  if (!["draft", "sent", "paid", "overdue"].includes(status))
    return res.status(400).json({ message: "Invalid invoice status." });
  const request = await get(
    "SELECT * FROM service_requests WHERE id=? AND status != 'pending_review'",
    [requestId],
  );
  if (!request)
    return res
      .status(400)
      .json({ message: "Only reviewed client requests can be invoiced." });
  const created = await run(
    "INSERT INTO invoices(request_id,user_id,amount,due_date,status,notes,created_by) VALUES(?,?,?,?,?,?,?)",
    [request.id, request.user_id, amount, dueDate, status, notes, req.user.id],
  );
  const invoiceNumber = `AJ-${String(created.id).padStart(6, "0")}`;
  await run("UPDATE invoices SET invoice_number=? WHERE id=?", [
    invoiceNumber,
    created.id,
  ]);
  if (status !== "draft")
    await notify(
      request.user_id,
      "New invoice available",
      `Invoice ${invoiceNumber} for ${request.service} is now available.`,
      "invoice",
    );
  res
    .status(201)
    .json({ message: `Invoice ${invoiceNumber} created.`, invoiceNumber });
};

exports.activity = async (req, res) =>
  res.json({
    activity: await all(
      "SELECT a.*,u.full_name FROM activity_logs a LEFT JOIN users u ON a.user_id=u.id ORDER BY a.created_at DESC LIMIT 50",
    ),
  });
