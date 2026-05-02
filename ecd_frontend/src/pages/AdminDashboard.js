import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const ROLE_OPTIONS = ["PARENT", "TEACHER", "ADMIN"];
const LOCAL_FOLLOW_UP_KEY = "admin_unresolved_followups";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userInfo, setUserInfo] = useState({ first_name: "Admin", last_name: "User", role: "ADMIN" });

  const [children, setChildren] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [reports, setReports] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [resources, setResources] = useState([]);

  const [userSearch, setUserSearch] = useState("");
  const [childSearch, setChildSearch] = useState("");
  const [savingId, setSavingId] = useState(null);

  // Edit child modal
  const [editingChild, setEditingChild] = useState(null);
  const [editChildForm, setEditChildForm] = useState({ name: "", age: "", parent_name: "", date_of_birth: "" });

  // Add child modal
  const [showAddChild, setShowAddChild] = useState(false);
  const [addChildForm, setAddChildForm] = useState({ name: "", age: "", parent_name: "", date_of_birth: "" });

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, id, label }

  const [reportFilters, setReportFilters] = useState({ child: "", from: "", to: "", teacher: "" });
  const [auditLogs, setAuditLogs] = useState([]);
  const [unresolvedFollowups, setUnresolvedFollowups] = useState(new Set());

  // ── init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) {
      try {
        const u = JSON.parse(s);
        setUserInfo({ first_name: u.first_name || "Admin", last_name: u.last_name || "User", role: u.role || "ADMIN" });
      } catch (_) {}
    }
    const p = localStorage.getItem(LOCAL_FOLLOW_UP_KEY);
    if (p) {
      try { setUnresolvedFollowups(new Set(JSON.parse(p))); } catch (_) {}
    }
    loadDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3500);
  };

  const addAuditLog = (msg) =>
    setAuditLogs((prev) => [{ id: Date.now(), message: msg, timestamp: new Date().toLocaleString() }, ...prev].slice(0, 15));

  // ── load data ─────────────────────────────────────────────────────────────
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const [childrenRes, profilesRes, reportsRes, followupsRes, activitiesRes, milestonesRes, resourcesRes] = await Promise.all([
        API.get("children/"),
        API.get("user_profiles/"),
        API.get("progress_reports/"),
        API.get("follow_up_messages/"),
        API.get("activities/"),
        API.get("milestones/"),
        API.get("elibrary/"),
      ]);
      setChildren(childrenRes.data || []);
      setProfiles(profilesRes.data || []);
      setReports(reportsRes.data || []);
      setFollowUps(followupsRes.data || []);
      setActivities(activitiesRes.data || []);
      setMilestones(milestonesRes.data || []);
      setResources(resourcesRes.data || []);
    } catch (err) {
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  // ── derived data ──────────────────────────────────────────────────────────
  const users = useMemo(() =>
    (profiles || []).map((profile) => ({
      profileId: profile.id,
      role: profile.role,
      id: profile.user?.id,
      username: profile.user?.username || "-",
      email: profile.user?.email || "-",
      first_name: profile.user?.first_name || "",
      last_name: profile.user?.last_name || "",
      is_active: profile.user?.is_active !== false,
      last_login: profile.user?.last_login,
      date_joined: profile.user?.date_joined,
    })), [profiles]);

  const childrenMap = useMemo(() => {
    const m = {};
    (children || []).forEach((c) => { m[c.id] = c; });
    return m;
  }, [children]);

  const reportCountByChild = useMemo(() => {
    const counts = {};
    (reports || []).forEach((r) => { counts[r.child] = (counts[r.child] || 0) + 1; });
    return counts;
  }, [reports]);

  const duplicateChildren = useMemo(() => {
    const groups = {};
    (children || []).forEach((child) => {
      const key = `${(child.name || "").trim().toLowerCase()}|${child.date_of_birth || ""}`;
      (groups[key] = groups[key] || []).push(child);
    });
    return Object.values(groups).filter((g) => g.length > 1);
  }, [children]);

  const stats = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return {
      totalChildren: (children || []).length,
      totalTeachers: users.filter((u) => u.role === "TEACHER").length,
      totalParents: users.filter((u) => u.role === "PARENT").length,
      newRegistrations: users.filter((u) => u.date_joined && new Date(u.date_joined) >= sevenDaysAgo).length,
      pendingReports: (children || []).filter((c) => !reportCountByChild[c.id]).length,
      incompleteChildProfiles: (children || []).filter((c) => !c.parent_name || !c.date_of_birth).length,
    };
  }, [users, children, reportCountByChild]);

  const failedUploads = useMemo(() => {
    return activities.filter((a) => !a.title || !a.description).length +
      resources.filter((r) => !r.title || !r.resource_type).length;
  }, [activities, resources]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      return u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || fullName.includes(term) || (u.role || "").toLowerCase().includes(term);
    });
  }, [users, userSearch]);

  const filteredChildren = useMemo(() => {
    const term = childSearch.trim().toLowerCase();
    if (!term) return children;
    return (children || []).filter((c) =>
      (c.name || "").toLowerCase().includes(term) || (c.parent_name || "").toLowerCase().includes(term)
    );
  }, [children, childSearch]);

  const filteredReports = useMemo(() =>
    (reports || []).filter((report) => {
      const childOk = !reportFilters.child || String(report.child) === String(reportFilters.child);
      const teacherOk = !reportFilters.teacher || (report.notes || "").toLowerCase().includes(reportFilters.teacher.toLowerCase());
      const reportDate = report.report_date ? new Date(report.report_date) : null;
      const fromOk = !reportFilters.from || (reportDate && reportDate >= new Date(reportFilters.from));
      const toOk = !reportFilters.to || (reportDate && reportDate <= new Date(reportFilters.to));
      return childOk && teacherOk && fromOk && toOk;
    }), [reports, reportFilters]);

  // ── user actions ──────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleRoleChange = async (profileId, newRole) => {
    try {
      setSavingId(profileId);
      await API.patch(`user_profiles/${profileId}/`, { role: newRole });
      setProfiles((prev) => prev.map((p) => p.id === profileId ? { ...p, role: newRole } : p));
      addAuditLog(`Changed user role to ${newRole}`);
      showSuccess("Role updated successfully.");
    } catch {
      setError("Failed to update role. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (profileId, currentActive) => {
    const nextState = !currentActive;
    try {
      setSavingId(profileId);
      await API.post(`user_profiles/${profileId}/set_active/`, { is_active: nextState });
      setProfiles((prev) => prev.map((p) => {
        if (p.id !== profileId) return p;
        return { ...p, user: { ...p.user, is_active: nextState } };
      }));
      addAuditLog(`${nextState ? "Activated" : "Deactivated"} user account`);
      showSuccess(`Account ${nextState ? "activated" : "deactivated"} successfully.`);
    } catch {
      setError("Failed to change account status. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteUser = async (profileId, email) => {
    try {
      setSavingId(profileId);
      await API.delete(`user_profiles/${profileId}/delete_user/`);
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      addAuditLog(`Deleted user account: ${email}`);
      showSuccess("User deleted successfully.");
      setConfirmDelete(null);
    } catch {
      setError("Failed to delete user. Please try again.");
      setConfirmDelete(null);
    } finally {
      setSavingId(null);
    }
  };

  const triggerPasswordReset = (email) => {
    if (!email || email === "-") { setError("No valid email for this user."); return; }
    addAuditLog(`Password reset requested for ${email}`);
    const subject = encodeURIComponent("GrowTogether: Password Reset Request");
    const body = encodeURIComponent(`Hello,\n\nA password reset has been requested for your GrowTogether account (${email}).\n\nPlease contact your administrator to complete this process.\n\nRegards,\nGrowTogether Admin`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
    showSuccess(`Password reset email drafted for ${email}.`);
  };

  // ── child actions ─────────────────────────────────────────────────────────
  const openChildEditor = (child) => {
    setEditingChild(child);
    setEditChildForm({ name: child.name || "", age: child.age ?? "", parent_name: child.parent_name || "", date_of_birth: child.date_of_birth || "" });
  };

  const closeChildEditor = () => {
    setEditingChild(null);
    setEditChildForm({ name: "", age: "", parent_name: "", date_of_birth: "" });
  };

  const saveChildEdit = async () => {
    if (!editingChild) return;
    try {
      setSavingId(`child-${editingChild.id}`);
      const payload = { name: editChildForm.name, age: editChildForm.age === "" ? null : Number(editChildForm.age), parent_name: editChildForm.parent_name, date_of_birth: editChildForm.date_of_birth || null };
      const res = await API.patch(`children/${editingChild.id}/`, payload);
      setChildren((prev) => prev.map((c) => c.id === editingChild.id ? res.data : c));
      addAuditLog(`Updated child profile: ${editChildForm.name}`);
      showSuccess("Child profile updated.");
      closeChildEditor();
    } catch {
      setError("Failed to update child profile.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteChild = async (childId, childName) => {
    try {
      setSavingId(`child-${childId}`);
      await API.delete(`children/${childId}/`);
      setChildren((prev) => prev.filter((c) => c.id !== childId));
      addAuditLog(`Deleted child record: ${childName}`);
      showSuccess("Child record deleted.");
      setConfirmDelete(null);
    } catch {
      setError("Failed to delete child record.");
      setConfirmDelete(null);
    } finally {
      setSavingId(null);
    }
  };

  const handleAddChild = async () => {
    if (!addChildForm.name.trim()) { setError("Child name is required."); return; }
    try {
      setSavingId("add-child");
      const payload = { name: addChildForm.name.trim(), age: addChildForm.age === "" ? null : Number(addChildForm.age), parent_name: addChildForm.parent_name, date_of_birth: addChildForm.date_of_birth || null };
      const res = await API.post("children/", payload);
      setChildren((prev) => [...prev, res.data]);
      addAuditLog(`Added new child: ${addChildForm.name}`);
      showSuccess("Child added successfully.");
      setShowAddChild(false);
      setAddChildForm({ name: "", age: "", parent_name: "", date_of_birth: "" });
    } catch {
      setError("Failed to add child record.");
    } finally {
      setSavingId(null);
    }
  };

  // ── follow-up actions ─────────────────────────────────────────────────────
  const toggleFollowUpResolved = (id) => {
    setUnresolvedFollowups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(LOCAL_FOLLOW_UP_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const sendTeacherReminder = () => {
    const emails = users.filter((u) => u.role === "TEACHER" && u.email && u.email !== "-").map((u) => u.email);
    if (!emails.length) { setError("No teacher emails found."); return; }
    const subject = encodeURIComponent("Reminder: Submit pending reports and follow-ups");
    const body = encodeURIComponent("Hello Team,\n\nPlease review pending progress reports and unresolved follow-up messages today.\n\nThank you.");
    window.open(`mailto:${emails.join(",")}?subject=${subject}&body=${body}`, "_blank");
    addAuditLog("Sent reminder email to teachers");
    showSuccess("Reminder email drafted and opened.");
  };

  const exportReportsCSV = () => {
    if (!filteredReports.length) { setError("No reports to export with current filters."); return; }
    const header = ["Report ID", "Child Name", "Report Date", "Score", "Notes"];
    const rows = filteredReports.map((r) => {
      const child = childrenMap[r.child];
      return [r.id, child?.name || "Unknown", r.report_date || "", r.overall_score ?? "", (r.notes || "").replace(/\n/g, " ").replace(/,/g, ";")];
    });
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "admin_reports_export.csv"; a.click();
    URL.revokeObjectURL(url);
    addAuditLog("Exported filtered reports as CSV");
    showSuccess(`Exported ${filteredReports.length} reports.`);
  };

  // ── styles ────────────────────────────────────────────────────────────────
  const layout = { display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", background: "#f7f8fc" };
  const sidebar = { background: "#fff", borderRight: "1px solid #e5e7eb", padding: "20px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "sticky", top: 0, height: "100vh" };
  const logoSection = { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", marginBottom: 32 };
  const logoIcon = { width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#a855f7,#d946ef)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 };
  const logoText = { fontWeight: 700, fontSize: 18, color: "#111827" };
  const navItem = (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, cursor: "pointer", color: active ? "#7c3aed" : "#374151", background: active ? "#f3e8ff" : "transparent", fontWeight: active ? 700 : 500, transition: "all 0.2s", marginBottom: 4 });
  const iconStyle = { width: 20, textAlign: "center" };
  const userSection = { borderTop: "1px solid #e5e7eb", paddingTop: 16, marginTop: "auto" };
  const userProfile = { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#f9fafb", borderRadius: 12 };
  const userAvatar = { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#d946ef)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 };
  const main = { padding: "32px 40px" };
  const header = { marginBottom: 20 };
  const titleSt = { fontSize: 26, fontWeight: 700, color: "#1f2937", marginBottom: 6 };
  const subtitle = { color: "#6b7280" };
  const alertError = { background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 10, marginBottom: 16, border: "1px solid #fecaca" };
  const alertSuccess = { background: "#dcfce7", color: "#166534", padding: "10px 14px", borderRadius: 10, marginBottom: 16, border: "1px solid #86efac" };
  const card = { background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" };
  const sectionTitle = { fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 14 };
  const topGrid = { display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 12, marginBottom: 16 };
  const smallCardTitle = { fontSize: 12, color: "#6b7280" };
  const smallCardValue = { fontSize: 24, fontWeight: 700, marginTop: 6, color: "#1f2937" };
  const twoCol = { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 16 };
  const threeCol = { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16, marginBottom: 16 };
  const inp = { width: "100%", border: "1px solid #d1d5db", borderRadius: 10, padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const table = { width: "100%", borderCollapse: "collapse" };
  const th = { textAlign: "left", padding: "12px 10px", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: 12, fontWeight: 700 };
  const td = { padding: "10px", borderBottom: "1px solid #f3f4f6", color: "#111827", fontSize: 13, verticalAlign: "middle" };
  const btn = { border: "none", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" };
  const btnPrimary = { ...btn, background: "#ede9fe", color: "#5b21b6" };
  const btnNeutral = { ...btn, background: "#f3f4f6", color: "#374151" };
  const btnDanger = { ...btn, background: "#fee2e2", color: "#b91c1c" };
  const btnGreen = { ...btn, background: "#dcfce7", color: "#166534" };
  const badge = { display: "inline-flex", alignItems: "center", padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700 };

  // modal overlay
  const overlay = { position: "fixed", inset: 0, background: "rgba(17,24,39,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
  const modalCard = { ...card, width: 460, maxWidth: "90vw" };

  return (
    <div style={layout}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <div>
          <div style={logoSection}>
            <div style={logoIcon}>👶</div>
            <div style={logoText}>GrowTogether</div>
          </div>
          <div style={navItem(true)}><span style={iconStyle}>🛡️</span> Admin Dashboard</div>
          <div style={navItem(false)} onClick={() => navigate("/teacher_dashboard")}><span style={iconStyle}>🏫</span> Teacher View</div>
          <div style={navItem(false)} onClick={() => navigate("/std_dashboard")}><span style={iconStyle}>👨‍👩‍👧</span> Parent View</div>
          <div style={navItem(false)} onClick={() => navigate("/students")}><span style={iconStyle}>👥</span> Students</div>
          <div style={navItem(false)} onClick={() => navigate("/e-library")}><span style={iconStyle}>📚</span> E-Library</div>
        </div>
        <div style={userSection}>
          <div style={userProfile}>
            <div style={userAvatar}>{(userInfo.first_name || "A")[0]}{(userInfo.last_name || "U")[0]}</div>
            <div>
              <div style={{ fontWeight: 600, color: "#111827" }}>{userInfo.first_name} {userInfo.last_name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{userInfo.role}</div>
            </div>
            <div style={{ marginLeft: "auto", cursor: "pointer", color: "#9ca3af" }} onClick={handleLogout} title="Logout">↗</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={main}>
        <div style={header}>
          <div style={titleSt}>Admin Dashboard</div>
          <div style={subtitle}>Manage users, children, content, reports, follow-up messages, alerts, and security from one place.</div>
        </div>

        {error && <div style={alertError}>{error} <button style={{ ...btn, float: "right", background: "transparent", color: "#b91c1c", padding: 0 }} onClick={() => setError("")}>✕</button></div>}
        {success && <div style={alertSuccess}>{success}</div>}
        {loading && <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 12 }}>Loading dashboard data…</div>}

        {/* Stats */}
        <div style={topGrid}>
          {[
            ["Total Children", stats.totalChildren, "👶"],
            ["Total Teachers", stats.totalTeachers, "🏫"],
            ["Total Parents", stats.totalParents, "👨‍👩‍👧"],
            ["New Registrations (7 days)", stats.newRegistrations, "🆕"],
            ["Pending Reports", stats.pendingReports, "📋"],
          ].map(([label, value, icon]) => (
            <div key={label} style={card}>
              <div style={smallCardTitle}>{icon} {label}</div>
              <div style={smallCardValue}>{value}</div>
            </div>
          ))}
        </div>

        {/* User Management + Alerts */}
        <div style={twoCol}>
          <div style={card}>
            <div style={sectionTitle}>User Management</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 12 }}>
              <input style={inp} placeholder="Search by name, role, email" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
              <button style={btnNeutral} onClick={loadDashboardData} disabled={loading}>Refresh</button>
            </div>
            <div style={{ maxHeight: 320, overflow: "auto" }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>User</th>
                    <th style={th}>Role</th>
                    <th style={th}>Status</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const busy = savingId === user.profileId;
                    return (
                      <tr key={user.profileId}>
                        <td style={td}>
                          <div style={{ fontWeight: 700 }}>{`${user.first_name} ${user.last_name}`.trim() || user.username}</div>
                          <div style={{ color: "#6b7280", fontSize: 12 }}>{user.email}</div>
                        </td>
                        <td style={td}>
                          <select style={{ ...inp, padding: "6px 8px" }} value={user.role || "PARENT"} disabled={busy} onChange={(e) => handleRoleChange(user.profileId, e.target.value)}>
                            {ROLE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </td>
                        <td style={td}>
                          <span style={{ ...badge, background: user.is_active ? "#dcfce7" : "#fee2e2", color: user.is_active ? "#166534" : "#b91c1c" }}>
                            {user.is_active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td style={td}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button style={user.is_active ? btnDanger : btnGreen} disabled={busy} onClick={() => handleToggleActive(user.profileId, user.is_active)}>
                              {busy ? "…" : user.is_active ? "Deactivate" : "Activate"}
                            </button>
                            <button style={btnNeutral} onClick={() => triggerPasswordReset(user.email)} disabled={busy}>Reset</button>
                            <button style={btnDanger} disabled={busy} onClick={() => setConfirmDelete({ type: "user", id: user.profileId, label: user.email })}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={4} style={{ ...td, color: "#9ca3af", textAlign: "center" }}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={card}>
            <div style={sectionTitle}>Notifications and Alerts</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["Incomplete child profiles", stats.incompleteChildProfiles, stats.incompleteChildProfiles > 0 ? "#fff7ed" : null],
                ["Failed data/upload issues", failedUploads, failedUploads > 0 ? "#fff7ed" : null],
                ["Duplicate child records", duplicateChildren.length, duplicateChildren.length > 0 ? "#fff7ed" : null],
                ["Unresolved follow-ups", unresolvedFollowups.size, unresolvedFollowups.size > 0 ? "#fff7ed" : null],
              ].map(([label, value, bg]) => (
                <div key={label} style={{ background: bg || "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
                  <div style={{ color: value > 0 ? "#9a3412" : "#6b7280", fontSize: 13, fontWeight: value > 0 ? 700 : 400 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Children + Content */}
        <div style={twoCol}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={sectionTitle}>Children and School Data</div>
              <button style={btnGreen} onClick={() => setShowAddChild(true)}>+ Add Child</button>
            </div>
            <input style={{ ...inp, marginBottom: 12 }} placeholder="Search child or parent name" value={childSearch} onChange={(e) => setChildSearch(e.target.value)} />
            <div style={{ maxHeight: 280, overflow: "auto" }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Child</th>
                    <th style={th}>Age</th>
                    <th style={th}>Parent</th>
                    <th style={th}>Reports</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.map((child) => {
                    const busy = savingId === `child-${child.id}`;
                    return (
                      <tr key={child.id}>
                        <td style={td}>{child.name}</td>
                        <td style={td}>{child.age ?? "N/A"}</td>
                        <td style={td}>{child.parent_name || "N/A"}</td>
                        <td style={td}>{reportCountByChild[child.id] || 0}</td>
                        <td style={td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button style={btnPrimary} disabled={busy} onClick={() => openChildEditor(child)}>Edit</button>
                            <button style={btnDanger} disabled={busy} onClick={() => setConfirmDelete({ type: "child", id: child.id, label: child.name })}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredChildren.length === 0 && (
                    <tr><td colSpan={5} style={{ ...td, color: "#9ca3af", textAlign: "center" }}>No children found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {duplicateChildren.length > 0 && (
              <div style={{ marginTop: 12, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, color: "#9a3412", marginBottom: 6 }}>⚠️ Potential duplicates detected</div>
                {duplicateChildren.slice(0, 4).map((group, idx) => (
                  <div key={idx} style={{ fontSize: 12, color: "#7c2d12", marginBottom: 4 }}>
                    {group.map((c) => `${c.name} (ID ${c.id})`).join(" | ")}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={card}>
            <div style={sectionTitle}>Learning Content Management</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["📝 Activities", `${activities.length} total`, "/activities"],
                ["📋 Milestones", `${milestones.length} total`, "/milestones"],
                ["📚 E-Library", `${resources.length} total resources`, "/e-library"],
              ].map(([label, desc, path]) => (
                <div key={label} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{label}</div>
                    <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{desc}</div>
                  </div>
                  <button style={btnPrimary} onClick={() => navigate(path)}>Manage</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reports + Follow-ups + Audit */}
        <div style={threeCol}>
          <div style={card}>
            <div style={sectionTitle}>Reports and Monitoring</div>
            <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
              <select style={inp} value={reportFilters.child} onChange={(e) => setReportFilters((p) => ({ ...p, child: e.target.value }))}>
                <option value="">All children</option>
                {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input style={inp} type="date" value={reportFilters.from} onChange={(e) => setReportFilters((p) => ({ ...p, from: e.target.value }))} />
              <input style={inp} type="date" value={reportFilters.to} onChange={(e) => setReportFilters((p) => ({ ...p, to: e.target.value }))} />
              <input style={inp} placeholder="Filter by keyword in notes" value={reportFilters.teacher} onChange={(e) => setReportFilters((p) => ({ ...p, teacher: e.target.value }))} />
            </div>
            <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 10 }}>Showing {filteredReports.length} / {reports.length} reports</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btnPrimary} onClick={exportReportsCSV}>📥 Export CSV</button>
              <button style={btnNeutral} onClick={() => setReportFilters({ child: "", from: "", to: "", teacher: "" })}>Clear filters</button>
            </div>
          </div>

          <div style={card}>
            <div style={sectionTitle}>Messages and Follow-up</div>
            <div style={{ maxHeight: 280, overflow: "auto" }}>
              {(followUps || []).length === 0 && <div style={{ color: "#9ca3af", fontSize: 13 }}>No follow-up messages yet.</div>}
              {(followUps || []).map((msg) => {
                const unresolved = unresolvedFollowups.has(msg.id);
                return (
                  <div key={msg.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, marginBottom: 8, background: unresolved ? "#fff7ed" : "#f9fafb" }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>{msg.parent_name} · Child ID {msg.child}</div>
                    <div style={{ fontSize: 13, color: "#111827", marginBottom: 6 }}>{msg.message}</div>
                    <button style={unresolved ? btnGreen : btnNeutral} onClick={() => toggleFollowUpResolved(msg.id)}>
                      {unresolved ? "✓ Mark Resolved" : "Mark Unresolved"}
                    </button>
                  </div>
                );
              })}
            </div>
            <button style={{ ...btnPrimary, marginTop: 8 }} onClick={sendTeacherReminder}>📧 Send Reminder to Teachers</button>
          </div>

          <div style={card}>
            <div style={sectionTitle}>Audit and Security</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Recent logins</div>
              <div style={{ maxHeight: 100, overflow: "auto" }}>
                {users.filter((u) => u.last_login).sort((a, b) => new Date(b.last_login) - new Date(a.last_login)).slice(0, 6).map((u) => (
                  <div key={u.profileId} style={{ fontSize: 12, marginBottom: 4, color: "#374151" }}>
                    <strong>{u.email}</strong><br />{new Date(u.last_login).toLocaleString()}
                  </div>
                ))}
                {users.filter((u) => u.last_login).length === 0 && <div style={{ fontSize: 12, color: "#9ca3af" }}>No login data yet.</div>}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Recent admin actions</div>
              <div style={{ maxHeight: 120, overflow: "auto" }}>
                {auditLogs.length === 0 && <div style={{ fontSize: 12, color: "#9ca3af" }}>No actions in this session yet.</div>}
                {auditLogs.map((log) => (
                  <div key={log.id} style={{ fontSize: 11, marginBottom: 5, color: "#374151", background: "#f9fafb", padding: "4px 8px", borderRadius: 6 }}>
                    <span style={{ color: "#6b7280" }}>{log.timestamp}</span><br />{log.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Modals ── */}

        {/* Edit child modal */}
        {editingChild && (
          <div style={overlay}>
            <div style={modalCard}>
              <div style={{ ...sectionTitle, marginBottom: 16 }}>Edit Child Profile</div>
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                {[["Child name", "name", "text"], ["Age", "age", "number"], ["Parent name", "parent_name", "text"], ["Date of birth", "date_of_birth", "date"]].map(([label, field, type]) => (
                  <div key={field}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</div>
                    <input style={inp} type={type} placeholder={label} value={editChildForm[field]} onChange={(e) => setEditChildForm((p) => ({ ...p, [field]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={btnNeutral} onClick={closeChildEditor} disabled={savingId === `child-${editingChild.id}`}>Cancel</button>
                <button style={btnPrimary} onClick={saveChildEdit} disabled={savingId === `child-${editingChild.id}`}>{savingId === `child-${editingChild.id}` ? "Saving…" : "Save"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Add child modal */}
        {showAddChild && (
          <div style={overlay}>
            <div style={modalCard}>
              <div style={{ ...sectionTitle, marginBottom: 16 }}>Add New Child</div>
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                {[["Child name *", "name", "text"], ["Age", "age", "number"], ["Parent name", "parent_name", "text"], ["Date of birth", "date_of_birth", "date"]].map(([label, field, type]) => (
                  <div key={field}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</div>
                    <input style={inp} type={type} placeholder={label} value={addChildForm[field]} onChange={(e) => setAddChildForm((p) => ({ ...p, [field]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={btnNeutral} onClick={() => { setShowAddChild(false); setAddChildForm({ name: "", age: "", parent_name: "", date_of_birth: "" }); }} disabled={savingId === "add-child"}>Cancel</button>
                <button style={btnGreen} onClick={handleAddChild} disabled={savingId === "add-child"}>{savingId === "add-child" ? "Adding…" : "Add Child"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm delete modal */}
        {confirmDelete && (
          <div style={overlay}>
            <div style={{ ...modalCard, width: 380 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#b91c1c", marginBottom: 12 }}>⚠️ Confirm Delete</div>
              <div style={{ color: "#374151", marginBottom: 20 }}>
                Are you sure you want to permanently delete <strong>{confirmDelete.label}</strong>? This cannot be undone.
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={btnNeutral} onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button style={btnDanger} onClick={() => {
                  if (confirmDelete.type === "user") handleDeleteUser(confirmDelete.id, confirmDelete.label);
                  else if (confirmDelete.type === "child") handleDeleteChild(confirmDelete.id, confirmDelete.label);
                }}>Delete Permanently</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;