import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const LOCAL_FOLLOW_UP_KEY = "admin_unresolved_followups";
const AUTH_ACTIVE_USER_KEY = "gt_active_auth_user";
const AUTH_LAST_ACTIVITY_KEY = "gt_auth_last_activity";
const AUTH_LOGIN_AT_KEY = "gt_auth_login_at";
const MILESTONE_CATEGORIES = [
  "social-emotional",
  "cognitive",
  "physical",
  "language",
  "self-care",
  "executive-function",
];
const RESOURCE_TYPES = ["PDF", "VIDEO", "IMAGE", "DOC"];
const RESOURCE_CATEGORIES = ["Nutrition", "Psychology", "Behavior", "Sleep", "Language", "Safety"];
const ACTIVITY_DOMAINS = [
  "Language",
  "Cognitive",
  "Physical",
  "Creative",
  "Fine Motor",
  "Social-Emotional",
  "Science",
  "Math + Physical",
];
const TEACHER_CATEGORY_OPTIONS = [
  { value: "social_emotional", label: "Social Emotional" },
  { value: "cognitive", label: "Cognitive" },
  { value: "physical", label: "Physical" },
  { value: "language", label: "Language" },
  { value: "self_care_independence", label: "Self Care & Independence" },
  { value: "executive_function_attention", label: "Executive Function & Attention" },
];

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
  const [milestoneCategories, setMilestoneCategories] = useState([]);
  const [milestoneTitles, setMilestoneTitles] = useState([]);
  const [resources, setResources] = useState([]);
  const [riskByChild, setRiskByChild] = useState({});

  const [userSearch, setUserSearch] = useState("");
  const [childSearch, setChildSearch] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accountType, setAccountType] = useState("PARENT");
  const [accountForm, setAccountForm] = useState({ first_name: "", last_name: "", email: "", password: "", category: "" });

  // Edit child modal
  const [editingChild, setEditingChild] = useState(null);
  const [editChildForm, setEditChildForm] = useState({ name: "", age: "", parent_name: "", date_of_birth: "" });

  // Add child modal
  const [showAddChild, setShowAddChild] = useState(false);
  const [addChildForm, setAddChildForm] = useState({ name: "", age: "", parent_name: "", date_of_birth: "" });

  const [editingMilestone, setEditingMilestone] = useState(null);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ child: "", category: "social-emotional", title: "", description: "", parent_note: "", date_achieved: "" });

  const [editingActivity, setEditingActivity] = useState(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [activityForm, setActivityForm] = useState({ title: "", description: "", age: "", duration: "", domain: "Language", milestone: "" });

  const [editingResource, setEditingResource] = useState(null);
  const [showAddResource, setShowAddResource] = useState(false);
  const [resourceForm, setResourceForm] = useState({ title: "", resource_type: "PDF", category: "Nutrition", description: "", image_file: null, image_preview: "", file_url: "" });

  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [followUpForm, setFollowUpForm] = useState({ child: "", milestone: "", parent_name: "", message: "" });
  const [newMilestoneCategoryName, setNewMilestoneCategoryName] = useState("");

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, id, label }

  const [, setAuditLogs] = useState([]);
  const [unresolvedFollowups, setUnresolvedFollowups] = useState(new Set());

  // ── init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const s = sessionStorage.getItem("user");
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

  const getApiErrorMessage = (err, fallback) => {
    if (err?.response?.status === 401) {
      return "Your session expired. Please log in again.";
    }

    const data = err?.response?.data;
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (data?.detail) return data.detail;

    if (typeof data === "object") {
      const firstKey = Object.keys(data)[0];
      const firstValue = data[firstKey];
      if (Array.isArray(firstValue) && firstValue.length > 0) {
        return `${firstKey}: ${firstValue[0]}`;
      }
      if (typeof firstValue === "string") {
        return `${firstKey}: ${firstValue}`;
      }
    }

    return fallback;
  };

  // ── load data ─────────────────────────────────────────────────────────────
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const endpoints = [
        ["children", "children/"],
        ["profiles", "user_profiles/"],
        ["reports", "progress_reports/"],
        ["followups", "follow_up_messages/"],
        ["activities", "activities/"],
        ["milestones", "milestones/"],
        ["milestoneCategories", "milestone_categories/"],
        ["milestoneTitles", "milestone_titles/"],
        ["resources", "elibrary/"],
      ];

      const results = await Promise.allSettled(
        endpoints.map(([, path]) => API.get(path, { skipCache: true }))
      );

      const payloadByKey = {};
      const failedKeys = [];
      results.forEach((result, index) => {
        const [key] = endpoints[index];
        if (result.status === "fulfilled") {
          payloadByKey[key] = result.value?.data || [];
        } else {
          payloadByKey[key] = [];
          failedKeys.push(key);
        }
      });

      setChildren(payloadByKey.children || []);
      setProfiles(payloadByKey.profiles || []);
      setReports(payloadByKey.reports || []);
      setFollowUps(payloadByKey.followups || []);
      setActivities(payloadByKey.activities || []);
      setMilestones(payloadByKey.milestones || []);
      setMilestoneCategories(payloadByKey.milestoneCategories || []);
      setMilestoneTitles(payloadByKey.milestoneTitles || []);
      setResources(payloadByKey.resources || []);

      if (failedKeys.length > 0) {
        setError("Some dashboard sections could not be loaded. Please refresh.");
      }

      const childrenData = payloadByKey.children || [];
      if (childrenData.length > 0) {
        const riskResults = await Promise.allSettled(
          childrenData.map((child) => API.get(`children/${child.id}/risk_assessment/`))
        );

        const nextRiskMap = {};
        riskResults.forEach((result, index) => {
          const childId = childrenData[index]?.id;
          if (!childId) return;
          if (result.status === "fulfilled") {
            nextRiskMap[childId] = result.value?.data?.risk_level || "UNKNOWN";
          } else {
            nextRiskMap[childId] = "UNKNOWN";
          }
        });
        setRiskByChild(nextRiskMap);
      } else {
        setRiskByChild({});
      }
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
      category: profile.category || "",
      id: profile.user?.id,
      username: profile.user?.username || "-",
      email: profile.user?.email || "-",
      first_name: profile.user?.first_name || "",
      last_name: profile.user?.last_name || "",
      is_active: profile.user?.is_active !== false,
      last_login: profile.user?.last_login,
      date_joined: profile.user?.date_joined,
    })), [profiles]);

  const formatCategory = (value) => {
    const matched = TEACHER_CATEGORY_OPTIONS.find((option) => option.value === value);
    if (matched) return matched.label;
    if (!value) return "-";
    return String(value)
      .replace(/-/g, "_")
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const childrenMap = useMemo(() => {
    const map = {};
    (children || []).forEach((child) => {
      map[child.id] = child;
    });
    return map;
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

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
      return u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || fullName.includes(term) || (u.role || "").toLowerCase().includes(term);
    });
  }, [users, userSearch]);

  const filteredParents = useMemo(
    () => filteredUsers.filter((u) => (u.role || "").toUpperCase() === "PARENT"),
    [filteredUsers]
  );

  const filteredTeachers = useMemo(
    () => filteredUsers.filter((u) => (u.role || "").toUpperCase() === "TEACHER"),
    [filteredUsers]
  );

  const filteredChildren = useMemo(() => {
    const term = childSearch.trim().toLowerCase();
    if (!term) return children;
    return (children || []).filter((c) =>
      (c.name || "").toLowerCase().includes(term) || (c.parent_name || "").toLowerCase().includes(term)
    );
  }, [children, childSearch]);

  const milestoneCategoryRows = useMemo(() => {
    const titlesByCategoryId = {};
    (milestoneTitles || []).forEach((item) => {
      if (!titlesByCategoryId[item.category]) titlesByCategoryId[item.category] = [];
      titlesByCategoryId[item.category].push(item);
    });

    return (milestoneCategories || []).map((category) => ({
      ...category,
      titles: titlesByCategoryId[category.id] || [],
    }));
  }, [milestoneCategories, milestoneTitles]);

  const formatMilestoneCategory = (value) =>
    String(value || "")
      .replace(/_/g, "-")
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "Uncategorized";

  const getChildAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const birth = new Date(dateOfBirth);
    const today = new Date();
    if (Number.isNaN(birth.getTime())) return "N/A";
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    const totalMonths = years * 12 + months;
    const ageYears = Math.max(Math.floor(totalMonths / 12), 0);
    const ageMonths = Math.max(totalMonths % 12, 0);
    return `${ageYears}y ${ageMonths}m`;
  };

  const getChildProgress = (child) => {
    const totalMilestones = Array.isArray(child?.milestones) ? child.milestones.length : 0;
    if (totalMilestones === 0) return 0;
    const completedCount = reportCountByChild[child.id] || 0;
    return Math.min(100, Math.round((completedCount / totalMilestones) * 100));
  };

  // ── user actions ──────────────────────────────────────────────────────────
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem(AUTH_ACTIVE_USER_KEY);
    localStorage.removeItem(AUTH_LAST_ACTIVITY_KEY);
    localStorage.removeItem(AUTH_LOGIN_AT_KEY);
    navigate("/login", { replace: true });
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
      const response = await API.delete(`user_profiles/${profileId}/delete_user/`);
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      const deletedChildIds = response?.data?.deleted_child_ids || [];
      if (deletedChildIds.length > 0) {
        setChildren((prev) => prev.filter((child) => !deletedChildIds.includes(child.id)));
      }
      addAuditLog(`Deleted user account: ${email}`);
      const deletedChildrenCount = response?.data?.deleted_children_count || 0;
      if (deletedChildrenCount > 0) {
        showSuccess(`User deleted successfully. Also deleted ${deletedChildrenCount} linked child record(s).`);
      } else {
        showSuccess("User deleted successfully.");
      }
      setConfirmDelete(null);
    } catch {
      setError("Failed to delete user. Please try again.");
      setConfirmDelete(null);
    } finally {
      setSavingId(null);
    }
  };

  const openAccountModal = (type) => {
    setAccountType(type);
    setAccountForm({ first_name: "", last_name: "", email: "", password: "", category: "" });
    setShowAddAccount(true);
  };

  const createAccount = async () => {
    if (!accountForm.email.trim() || !accountForm.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSavingId(`account-${accountType}`);
      const payload = {
        email: accountForm.email.trim(),
        password: accountForm.password,
        first_name: accountForm.first_name,
        last_name: accountForm.last_name,
        role: accountType,
        category: accountType === "TEACHER" ? accountForm.category : "",
      };
      const response = await API.post("admin-create-account/", payload);
      const createdUser = response?.data?.user || response?.data || {};

      setProfiles((prev) => [
        ...prev,
        {
          id: createdUser.id || Date.now(),
          role: accountType,
          category: createdUser.category || payload.category || "",
          user: {
            id: createdUser.id,
            username: createdUser.username || accountForm.email.trim(),
            email: createdUser.email || accountForm.email.trim(),
            first_name: createdUser.first_name || accountForm.first_name,
            last_name: createdUser.last_name || accountForm.last_name,
            is_active: true,
          },
        },
      ]);
      addAuditLog(`Created ${accountType.toLowerCase()} account: ${accountForm.email.trim()}`);
      showSuccess(`${accountType === "PARENT" ? "Parent" : "Teacher"} account created successfully.`);
      setShowAddAccount(false);
    } catch (err) {
      const message = err?.response?.data?.email?.[0] || err?.response?.data?.detail || "Failed to create account.";
      setError(message);
    } finally {
      setSavingId(null);
    }
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

  // ── milestone actions ────────────────────────────────────────────────────
  const resetMilestoneForm = () => {
    setMilestoneForm({ child: "", category: "social-emotional", title: "", description: "", parent_note: "", date_achieved: "" });
  };

  const addMilestoneCategory = async () => {
    const name = newMilestoneCategoryName.trim();
    if (!name) {
      setError("Category name is required.");
      return;
    }

    try {
      setSavingId("milestone-category-add");
      const res = await API.post("milestone_categories/", { name });
      setMilestoneCategories((prev) => [...prev, res.data]);
      setNewMilestoneCategoryName("");
      addAuditLog(`Added milestone category: ${name}`);
      showSuccess("Milestone category added.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to add milestone category."));
    } finally {
      setSavingId(null);
    }
  };

  const renameMilestoneCategory = async (category) => {
    const nextName = window.prompt("Enter updated category name:", category.name || "");
    if (nextName === null) return;
    const name = nextName.trim();
    if (!name) {
      setError("Category name is required.");
      return;
    }

    try {
      setSavingId(`milestone-category-${category.id}`);
      const res = await API.patch(`milestone_categories/${category.id}/`, { name });
      setMilestoneCategories((prev) => prev.map((item) => (item.id === category.id ? res.data : item)));
      addAuditLog(`Renamed milestone category: ${category.name} -> ${name}`);
      showSuccess("Milestone category updated.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update milestone category."));
    } finally {
      setSavingId(null);
    }
  };

  const deleteMilestoneCategory = async (category) => {
    const confirmed = window.confirm(`Delete category "${category.name}" and all its titles?`);
    if (!confirmed) return;

    try {
      setSavingId(`milestone-category-${category.id}`);
      await API.delete(`milestone_categories/${category.id}/`);
      setMilestoneCategories((prev) => prev.filter((item) => item.id !== category.id));
      setMilestoneTitles((prev) => prev.filter((item) => item.category !== category.id));
      addAuditLog(`Deleted milestone category: ${category.name}`);
      showSuccess("Milestone category deleted.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete milestone category."));
    } finally {
      setSavingId(null);
    }
  };

  const addMilestoneTitle = async (category) => {
    const enteredTitle = window.prompt(`Enter title for category "${category.name}":`, "");
    if (enteredTitle === null) return;
    const title = enteredTitle.trim();
    if (!title) {
      setError("Title is required.");
      return;
    }

    const enteredDescription = window.prompt("Enter description (optional):", "");
    if (enteredDescription === null) return;
    const description = enteredDescription.trim();

    try {
      setSavingId(`milestone-title-add-${category.id}`);
      const res = await API.post("milestone_titles/", {
        category: category.id,
        title,
        description,
      });
      setMilestoneTitles((prev) => [res.data, ...prev]);
      addAuditLog(`Added milestone title in ${category.name}: ${title}`);
      showSuccess("Milestone title added.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to add milestone title."));
    } finally {
      setSavingId(null);
    }
  };

  const editMilestoneTitle = async (titleItem) => {
    const enteredTitle = window.prompt("Edit title:", titleItem.title || "");
    if (enteredTitle === null) return;
    const title = enteredTitle.trim();
    if (!title) {
      setError("Title is required.");
      return;
    }

    const enteredDescription = window.prompt("Edit description (optional):", titleItem.description || "");
    if (enteredDescription === null) return;
    const description = enteredDescription.trim();

    try {
      setSavingId(`milestone-title-${titleItem.id}`);
      const res = await API.patch(`milestone_titles/${titleItem.id}/`, {
        title,
        description,
      });
      setMilestoneTitles((prev) => prev.map((item) => (item.id === titleItem.id ? res.data : item)));
      addAuditLog(`Updated milestone title: ${title}`);
      showSuccess("Milestone title updated.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update milestone title."));
    } finally {
      setSavingId(null);
    }
  };

  const deleteMilestoneTitle = async (titleItem) => {
    const confirmed = window.confirm(`Delete title "${titleItem.title}"?`);
    if (!confirmed) return;

    try {
      setSavingId(`milestone-title-${titleItem.id}`);
      await API.delete(`milestone_titles/${titleItem.id}/`);
      setMilestoneTitles((prev) => prev.filter((item) => item.id !== titleItem.id));
      addAuditLog(`Deleted milestone title: ${titleItem.title}`);
      showSuccess("Milestone title deleted.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete milestone title."));
    } finally {
      setSavingId(null);
    }
  };

  const openMilestoneEditor = (milestone) => {
    setEditingMilestone(milestone);
    setMilestoneForm({
      child: milestone.child ? String(milestone.child) : "",
      category: milestone.category || "social-emotional",
      title: milestone.title || "",
      description: milestone.description || "",
      parent_note: milestone.parent_note || "",
      date_achieved: milestone.date_achieved || "",
    });
  };

  const saveMilestone = async () => {
    if (!milestoneForm.child || !milestoneForm.title.trim() || !milestoneForm.description.trim()) {
      setError("Milestone requires child, title, and description.");
      return;
    }
    const payload = {
      child: Number(milestoneForm.child),
      category: milestoneForm.category,
      title: milestoneForm.title.trim(),
      description: milestoneForm.description.trim(),
      parent_note: milestoneForm.parent_note,
      date_achieved: milestoneForm.date_achieved || null,
    };

    try {
      if (editingMilestone) {
        setSavingId(`milestone-${editingMilestone.id}`);
        const res = await API.patch(`milestones/${editingMilestone.id}/`, payload);
        setMilestones((prev) => prev.map((item) => (item.id === editingMilestone.id ? res.data : item)));
        addAuditLog(`Updated milestone: ${payload.title}`);
        showSuccess("Milestone updated.");
      } else {
        setSavingId("milestone-add");
        const res = await API.post("milestones/", payload);
        setMilestones((prev) => [res.data, ...prev]);
        addAuditLog(`Added milestone: ${payload.title}`);
        showSuccess("Milestone added.");
      }
      setEditingMilestone(null);
      setShowAddMilestone(false);
      resetMilestoneForm();
    } catch {
      setError("Failed to save milestone.");
    } finally {
      setSavingId(null);
    }
  };

  const deleteMilestone = async (id, title) => {
    try {
      setSavingId(`milestone-${id}`);
      await API.delete(`milestones/${id}/`);
      setMilestones((prev) => prev.filter((item) => item.id !== id));
      addAuditLog(`Deleted milestone: ${title}`);
      showSuccess("Milestone deleted.");
      setConfirmDelete(null);
    } catch {
      setError("Failed to delete milestone.");
      setConfirmDelete(null);
    } finally {
      setSavingId(null);
    }
  };

  // ── activity actions ─────────────────────────────────────────────────────
  const resetActivityForm = () => {
    setActivityForm({ title: "", description: "", age: "", duration: "", domain: "Language", milestone: "" });
  };

  const saveActivity = async () => {
    if (!activityForm.title.trim() || !activityForm.description.trim()) {
      setError("Activity requires title and description.");
      return;
    }

    const payload = {
      title: activityForm.title.trim(),
      description: activityForm.description.trim(),
      age: activityForm.age || null,
      duration: activityForm.duration || null,
      domain: activityForm.domain || null,
      milestone: activityForm.milestone ? Number(activityForm.milestone) : null,
    };

    try {
      if (editingActivity) {
        setSavingId(`activity-${editingActivity.id}`);
        const res = await API.patch(`activities/${editingActivity.id}/`, payload);
        setActivities((prev) => prev.map((item) => (item.id === editingActivity.id ? res.data : item)));
        addAuditLog(`Updated activity: ${payload.title}`);
        showSuccess("Activity updated.");
      } else {
        setSavingId("activity-add");
        const res = await API.post("activities/", payload);
        setActivities((prev) => [res.data, ...prev]);
        addAuditLog(`Added activity: ${payload.title}`);
        showSuccess("Activity added.");
      }
      setEditingActivity(null);
      setShowAddActivity(false);
      resetActivityForm();
    } catch {
      setError("Failed to save activity.");
    } finally {
      setSavingId(null);
    }
  };

  const deleteActivity = async (id, title) => {
    try {
      setSavingId(`activity-${id}`);
      await API.delete(`activities/${id}/`);
      setActivities((prev) => prev.filter((item) => item.id !== id));
      addAuditLog(`Deleted activity: ${title}`);
      showSuccess("Activity deleted.");
      setConfirmDelete(null);
    } catch {
      setError("Failed to delete activity.");
      setConfirmDelete(null);
    } finally {
      setSavingId(null);
    }
  };

  // ── resource actions ─────────────────────────────────────────────────────
  const resetResourceForm = () => {
    setResourceForm({ title: "", resource_type: "PDF", category: "Nutrition", description: "", image_file: null, image_preview: "", file_url: "" });
  };

  const openResourceEditor = (resource) => {
    setEditingResource(resource);
    setResourceForm({
      title: resource.title || "",
      resource_type: resource.resource_type || "PDF",
      category: resource.category || "Nutrition",
      description: resource.description || "",
      image_file: null,
      image_preview: resource.image || "",
      file_url: resource.file_url || "",
    });
  };

  const saveResource = async () => {
    if (!resourceForm.title.trim()) {
      setError("Resource title is required.");
      return;
    }

    const payload = new FormData();
    payload.append("title", resourceForm.title.trim());
    payload.append("resource_type", resourceForm.resource_type);
    payload.append("category", resourceForm.category);
    payload.append("description", resourceForm.description || "");
    payload.append("file_url", resourceForm.file_url || "");
    if (resourceForm.image_file instanceof File) {
      payload.append("image_file", resourceForm.image_file);
    }

    try {
      if (editingResource) {
        setSavingId(`resource-${editingResource.id}`);
        const res = await API.patch(`elibrary/${editingResource.id}/`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setResources((prev) => prev.map((item) => (item.id === editingResource.id ? res.data : item)));
        addAuditLog(`Updated e-library resource: ${resourceForm.title.trim()}`);
        showSuccess("Resource updated.");
      } else {
        setSavingId("resource-add");
        const res = await API.post("elibrary/", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setResources((prev) => [res.data, ...prev]);
        addAuditLog(`Added e-library resource: ${resourceForm.title.trim()}`);
        showSuccess("Resource added.");
      }
      setEditingResource(null);
      setShowAddResource(false);
      resetResourceForm();
    } catch {
      setError("Failed to save e-library resource.");
    } finally {
      setSavingId(null);
    }
  };

  const deleteResource = async (id, title) => {
    try {
      setSavingId(`resource-${id}`);
      await API.delete(`elibrary/${id}/`);
      setResources((prev) => prev.filter((item) => item.id !== id));
      addAuditLog(`Deleted e-library resource: ${title}`);
      showSuccess("Resource deleted.");
      setConfirmDelete(null);
    } catch {
      setError("Failed to delete e-library resource.");
      setConfirmDelete(null);
    } finally {
      setSavingId(null);
    }
  };

  // ── follow-up CRUD actions ───────────────────────────────────────────────
  const resetFollowUpForm = () => {
    setFollowUpForm({ child: "", milestone: "", parent_name: "", message: "" });
  };

  const getChildIdForMilestone = (milestoneId) => {
    const selectedMilestone = milestones.find((item) => String(item.id) === String(milestoneId));
    return selectedMilestone?.child ? String(selectedMilestone.child) : "";
  };

  const getParentNameForMilestone = (milestoneId) => {
    const selectedMilestone = milestones.find((item) => String(item.id) === String(milestoneId));
    if (!selectedMilestone) return "";
    const child = childrenMap[selectedMilestone.child];
    return child?.parent_name || "";
  };

  const openFollowUpEditor = (followUp) => {
    setEditingFollowUp(followUp);
    const resolvedParentName = followUp.parent_name || getParentNameForMilestone(followUp.milestone);
    const resolvedChildId = followUp.child ? String(followUp.child) : getChildIdForMilestone(followUp.milestone);
    setFollowUpForm({
      child: resolvedChildId,
      milestone: followUp.milestone ? String(followUp.milestone) : "",
      parent_name: resolvedParentName || "",
      message: followUp.message || "",
    });
  };

  const saveFollowUp = async () => {
    if (!followUpForm.milestone || !followUpForm.message.trim()) {
      setError("Follow-up requires milestone and message.");
      return;
    }

    const payload = {
      child: Number(followUpForm.child || getChildIdForMilestone(followUpForm.milestone)),
      milestone: Number(followUpForm.milestone),
      parent_name: followUpForm.parent_name || "Parent",
      message: followUpForm.message.trim(),
    };

    if (!payload.child) {
      setError("Unable to resolve child for the selected milestone.");
      return;
    }

    try {
      if (editingFollowUp) {
        setSavingId(`followup-${editingFollowUp.id}`);
        const res = await API.patch(`follow_up_messages/${editingFollowUp.id}/`, payload);
        setFollowUps((prev) => prev.map((item) => (item.id === editingFollowUp.id ? res.data : item)));
        addAuditLog(`Updated follow-up message #${editingFollowUp.id}`);
        showSuccess("Follow-up message updated.");
      } else {
        setSavingId("followup-add");
        const res = await API.post("follow_up_messages/", payload);
        setFollowUps((prev) => [res.data, ...prev]);
        addAuditLog("Added follow-up message");
        showSuccess("Follow-up message added.");
      }
      setEditingFollowUp(null);
      setShowAddFollowUp(false);
      resetFollowUpForm();
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to save follow-up message.");
      setError(message);
      if (err?.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setSavingId(null);
    }
  };

  const deleteFollowUp = async (id) => {
    try {
      setSavingId(`followup-${id}`);
      await API.delete(`follow_up_messages/${id}/`);
      setFollowUps((prev) => prev.filter((item) => item.id !== id));
      addAuditLog(`Deleted follow-up message #${id}`);
      showSuccess("Follow-up message deleted.");
      setConfirmDelete(null);
    } catch {
      setError("Failed to delete follow-up message.");
      setConfirmDelete(null);
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

  // ── styles ────────────────────────────────────────────────────────────────
  const layout = { display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", background: "#f7f8fc" };
  const sidebar = { background: "#fff", borderRight: "1px solid #e5e7eb", padding: "20px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "sticky", top: 0, height: "100vh" };
  const logoSection = { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", marginBottom: 32 };
  const logoIcon = { width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#a855f7,#d946ef)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 };
  const logoText = { fontWeight: 700, fontSize: 18, color: "#111827" };
  const navItem = (active, disabled = false) => ({ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", color: active ? "#7c3aed" : disabled ? "#9ca3af" : "#374151", background: active ? "#f3e8ff" : "transparent", fontWeight: active ? 700 : 500, transition: "all 0.2s", marginBottom: 4 });
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
  const bottomTwoCol = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 };
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
          <div style={navItem(false, true)} title="Parent/Teacher library view"><span style={iconStyle}>📚</span> E-Library</div>
        </div>
        <div style={userSection}>
          <div style={userProfile}>
            <div style={userAvatar}>{(userInfo.first_name || "A")[0]}{(userInfo.last_name || "U")[0]}</div>
            <div>
              <div style={{ fontWeight: 600, color: "#111827" }}>{userInfo.first_name} {userInfo.last_name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{userInfo.role}</div>
            </div>
          </div>
          <button
            type="button"
            style={{ width: "100%", marginTop: 12, border: "1px solid #fecaca", background: "#fee2e2", color: "#b91c1c", borderRadius: 10, padding: "10px 12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={main}>
        <div style={header}>
          <div style={titleSt}>Admin Dashboard</div>
          <div style={subtitle}>Manage users, children, content, reports, follow-up messages, and security from one place.</div>
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

        {/* User Management */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={sectionTitle}>User Management</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={btnGreen} onClick={() => openAccountModal("PARENT")}>+ Add Parent</button>
              <button style={btnGreen} onClick={() => openAccountModal("TEACHER")}>+ Add Teacher</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 12 }}>
            <input style={inp} placeholder="Search by parent/teacher name or email" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
            <button style={btnNeutral} onClick={loadDashboardData} disabled={loading}>Refresh</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Parents</div>
              <div style={{ maxHeight: 300, overflow: "auto" }}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Parent</th>
                      <th style={th}>Status</th>
                      <th style={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParents.map((user) => {
                      const busy = savingId === user.profileId;
                      return (
                        <tr key={user.profileId}>
                          <td style={td}>
                            <div style={{ fontWeight: 700 }}>{`${user.first_name} ${user.last_name}`.trim() || user.username}</div>
                            <div style={{ color: "#6b7280", fontSize: 12 }}>{user.email}</div>
                          </td>
                          <td style={td}>
                            <span style={{ ...badge, background: user.is_active ? "#dcfce7" : "#fee2e2", color: user.is_active ? "#166534" : "#b91c1c" }}>
                              {user.is_active ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </td>
                          <td style={td}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <button style={user.is_active ? btnDanger : btnGreen} disabled={busy} onClick={() => handleToggleActive(user.profileId, user.is_active)}>{user.is_active ? "Deactivate" : "Activate"}</button>
                              <button style={btnDanger} disabled={busy} onClick={() => setConfirmDelete({ type: "user", id: user.profileId, label: user.email })}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredParents.length === 0 && <tr><td colSpan={3} style={{ ...td, color: "#9ca3af", textAlign: "center" }}>No parents found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Teachers</div>
              <div style={{ maxHeight: 300, overflow: "auto" }}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Teacher</th>
                      <th style={th}>Category</th>
                      <th style={th}>Status</th>
                      <th style={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map((user) => {
                      const busy = savingId === user.profileId;
                      return (
                        <tr key={user.profileId}>
                          <td style={td}>
                            <div style={{ fontWeight: 700 }}>{`${user.first_name} ${user.last_name}`.trim() || user.username}</div>
                            <div style={{ color: "#6b7280", fontSize: 12 }}>{user.email}</div>
                          </td>
                          <td style={td}>{formatCategory(user.category)}</td>
                          <td style={td}>
                            <span style={{ ...badge, background: user.is_active ? "#dcfce7" : "#fee2e2", color: user.is_active ? "#166534" : "#b91c1c" }}>
                              {user.is_active ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </td>
                          <td style={td}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <button style={user.is_active ? btnDanger : btnGreen} disabled={busy} onClick={() => handleToggleActive(user.profileId, user.is_active)}>{user.is_active ? "Deactivate" : "Activate"}</button>
                              <button style={btnDanger} disabled={busy} onClick={() => setConfirmDelete({ type: "user", id: user.profileId, label: user.email })}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTeachers.length === 0 && <tr><td colSpan={4} style={{ ...td, color: "#9ca3af", textAlign: "center" }}>No teachers found</td></tr>}
                  </tbody>
                </table>
              </div>
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
                    <th style={th}>Student</th>
                    <th style={th}>Date of Birth</th>
                    <th style={th}>Age</th>
                    <th style={th}>Parent</th>
                    <th style={th}>Progress</th>
                    <th style={th}>Risk Level</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.map((child) => {
                    const busy = savingId === `child-${child.id}`;
                    const risk = (riskByChild[child.id] || "UNKNOWN").toUpperCase();
                    const riskStyle =
                      risk === "HIGH"
                        ? { background: "#fee2e2", color: "#b91c1c" }
                        : risk === "MEDIUM"
                          ? { background: "#fef3c7", color: "#b45309" }
                          : risk === "LOW"
                            ? { background: "#dcfce7", color: "#166534" }
                            : { background: "#f3f4f6", color: "#4b5563" };
                    return (
                      <tr key={child.id}>
                        <td style={td}>{child.name}</td>
                        <td style={td}>{child.date_of_birth || "N/A"}</td>
                        <td style={td}>{child.age ?? getChildAge(child.date_of_birth)}</td>
                        <td style={td}>{child.parent_name || "N/A"}</td>
                        <td style={td}>{getChildProgress(child)}%</td>
                        <td style={td}><span style={{ ...badge, ...riskStyle }}>{risk}</span></td>
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
                    <tr><td colSpan={7} style={{ ...td, color: "#9ca3af", textAlign: "center" }}>No children found</td></tr>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={sectionTitle}>E-Library Content Management</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={btnGreen} onClick={() => { setShowAddResource(true); setEditingResource(null); resetResourceForm(); }}>+ Resource</button>
              </div>
            </div>

            <div style={{ marginBottom: 10, fontSize: 12, color: "#6b7280" }}>
              Total resources: {resources.length} · Activities linked in system: {activities.length}
            </div>

            <div style={{ maxHeight: 290, overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 10 }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Title</th>
                    <th style={th}>Type</th>
                    <th style={th}>Category</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={`r-${r.id}`}>
                      <td style={td}>{r.title}</td>
                      <td style={td}>{r.resource_type || "-"}</td>
                      <td style={td}>{r.category}</td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={btnPrimary} onClick={() => openResourceEditor(r)}>Edit</button>
                          <button style={btnDanger} onClick={() => setConfirmDelete({ type: "resource", id: r.id, label: r.title })}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {resources.length === 0 && (
                    <tr><td colSpan={4} style={{ ...td, color: "#9ca3af", textAlign: "center" }}>No e-library resources found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <button style={btnPrimary} onClick={() => navigate("/e-library")}>Open E-Library Page</button>
          </div>
        </div>

        {/* Follow-ups + Audit */}
        <div style={bottomTwoCol}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={sectionTitle}>Messages and Follow-up</div>
              <button style={btnGreen} onClick={() => { setShowAddFollowUp(true); setEditingFollowUp(null); resetFollowUpForm(); }}>+ Follow-up</button>
            </div>
            <div style={{ maxHeight: 280, overflow: "auto" }}>
              {(followUps || []).length === 0 && <div style={{ color: "#9ca3af", fontSize: 13 }}>No follow-up messages yet.</div>}
              {(followUps || []).map((msg) => {
                const unresolved = unresolvedFollowups.has(msg.id);
                const busy = savingId === `followup-${msg.id}`;
                return (
                  <div key={msg.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, marginBottom: 8, background: unresolved ? "#fff7ed" : "#f9fafb" }}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>{msg.parent_name} · Child {childrenMap[msg.child]?.name || `#${msg.child}`} · Milestone #{msg.milestone || "-"}</div>
                    <div style={{ fontSize: 13, color: "#111827", marginBottom: 6 }}>{msg.message}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button style={unresolved ? btnGreen : btnNeutral} onClick={() => toggleFollowUpResolved(msg.id)}>
                        {unresolved ? "✓ Mark Resolved" : "Mark Unresolved"}
                      </button>
                      <button style={btnPrimary} onClick={() => openFollowUpEditor(msg)} disabled={busy}>Edit</button>
                      <button style={btnDanger} onClick={() => setConfirmDelete({ type: "followup", id: msg.id, label: `follow-up #${msg.id}` })} disabled={busy}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button style={{ ...btnPrimary, marginTop: 8 }} onClick={sendTeacherReminder}>📧 Send Reminder to Teachers</button>
          </div>

          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={sectionTitle}>Milestone Management</div>
              <button style={btnGreen} onClick={() => { setShowAddMilestone(true); setEditingMilestone(null); resetMilestoneForm(); }}>+ Milestone</button>
            </div>

            <div style={{ marginBottom: 10, fontSize: 12, color: "#6b7280" }}>
              Total milestones: {milestones.length}
            </div>

            <div style={{ maxHeight: 280, overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 10 }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Milestone</th>
                    <th style={th}>Category</th>
                    <th style={th}>Child</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((m) => (
                    <tr key={`m-${m.id}`}>
                      <td style={td}>{m.title}</td>
                      <td style={td}>{m.category}</td>
                      <td style={td}>{childrenMap[m.child]?.name || `#${m.child}`}</td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={btnPrimary} onClick={() => openMilestoneEditor(m)}>Edit</button>
                          <button style={btnDanger} onClick={() => setConfirmDelete({ type: "milestone", id: m.id, label: m.title })}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {milestones.length === 0 && (
                    <tr><td colSpan={4} style={{ ...td, color: "#9ca3af", textAlign: "center" }}>No milestones found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: "#111827" }}>Category-wise Milestone Management</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 8 }}>
              <input
                style={inp}
                placeholder="Add new category (example: creative-thinking)"
                value={newMilestoneCategoryName}
                onChange={(e) => setNewMilestoneCategoryName(e.target.value)}
              />
              <button
                style={btnGreen}
                onClick={addMilestoneCategory}
                disabled={savingId === "milestone-category-add"}
              >
                {savingId === "milestone-category-add" ? "Adding..." : "+ Category"}
              </button>
            </div>

            <div style={{ marginTop: 8, maxHeight: 320, overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 10 }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Category</th>
                    <th style={th}>Titles in Category</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {milestoneCategoryRows.map((row) => (
                    <tr key={`milestone-category-${row.id}`}>
                      <td style={td}>{formatMilestoneCategory(row.name)}</td>
                      <td style={td}>
                        {row.titles.length === 0 ? (
                          <span style={{ color: "#9ca3af" }}>No titles yet.</span>
                        ) : (
                          row.titles.map((titleItem) => (
                            <div key={`milestone-title-${titleItem.id}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                              <span>{titleItem.title}</span>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  style={btnPrimary}
                                  onClick={() => editMilestoneTitle(titleItem)}
                                  disabled={savingId === `milestone-title-${titleItem.id}`}
                                >
                                  Edit
                                </button>
                                <button
                                  style={btnDanger}
                                  onClick={() => deleteMilestoneTitle(titleItem)}
                                  disabled={savingId === `milestone-title-${titleItem.id}`}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                        <button
                          style={{ ...btnGreen, marginTop: 6 }}
                          onClick={() => addMilestoneTitle(row)}
                          disabled={savingId === `milestone-title-add-${row.id}`}
                        >
                          {savingId === `milestone-title-add-${row.id}` ? "Adding..." : "+ Add Title"}
                        </button>
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            style={btnPrimary}
                            onClick={() => renameMilestoneCategory(row)}
                            disabled={savingId === `milestone-category-${row.id}`}
                          >
                            Rename
                          </button>
                          <button
                            style={btnDanger}
                            onClick={() => deleteMilestoneCategory(row)}
                            disabled={savingId === `milestone-category-${row.id}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {milestoneCategoryRows.length === 0 && (
                    <tr><td colSpan={3} style={{ ...td, color: "#9ca3af", textAlign: "center" }}>No milestone categories found.</td></tr>
                  )}
                </tbody>
              </table>
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

        {/* Add account modal */}
        {showAddAccount && (
          <div style={overlay}>
            <div style={modalCard}>
              <div style={{ ...sectionTitle, marginBottom: 6 }}>{accountType === "PARENT" ? "Add Parent" : "Add Teacher"}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>
                Create a login ID using email and set a password for the new {accountType.toLowerCase()} account.
              </div>
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <input style={inp} placeholder="First name" value={accountForm.first_name} onChange={(e) => setAccountForm((p) => ({ ...p, first_name: e.target.value }))} />
                <input style={inp} placeholder="Last name" value={accountForm.last_name} onChange={(e) => setAccountForm((p) => ({ ...p, last_name: e.target.value }))} />
                <input style={inp} type="email" placeholder="Email / ID" value={accountForm.email} onChange={(e) => setAccountForm((p) => ({ ...p, email: e.target.value }))} />
                <input style={inp} type="password" placeholder="Password" value={accountForm.password} onChange={(e) => setAccountForm((p) => ({ ...p, password: e.target.value }))} />
                {accountType === "TEACHER" && (
                  <select style={inp} value={accountForm.category} onChange={(e) => setAccountForm((p) => ({ ...p, category: e.target.value }))}>
                    <option value="">Select specialization (optional)</option>
                    {TEACHER_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={btnNeutral} onClick={() => setShowAddAccount(false)} disabled={savingId === `account-${accountType}`}>Cancel</button>
                <button style={btnGreen} onClick={createAccount} disabled={savingId === `account-${accountType}`}>{savingId === `account-${accountType}` ? "Creating..." : `Create ${accountType === "PARENT" ? "Parent" : "Teacher"}`}</button>
              </div>
            </div>
          </div>
        )}

        {/* Milestone modal */}
        {(showAddMilestone || editingMilestone) && (
          <div style={overlay}>
            <div style={modalCard}>
              <div style={{ ...sectionTitle, marginBottom: 16 }}>{editingMilestone ? "Edit Milestone" : "Add Milestone"}</div>
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <select style={inp} value={milestoneForm.child} onChange={(e) => setMilestoneForm((p) => ({ ...p, child: e.target.value }))}>
                  <option value="">Select child</option>
                  {children.map((c) => <option key={c.id} value={c.id}>{c.name} (#{c.id})</option>)}
                </select>
                <select style={inp} value={milestoneForm.category} onChange={(e) => setMilestoneForm((p) => ({ ...p, category: e.target.value }))}>
                  {MILESTONE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input style={inp} placeholder="Title" value={milestoneForm.title} onChange={(e) => setMilestoneForm((p) => ({ ...p, title: e.target.value }))} />
                <textarea style={{ ...inp, minHeight: 84 }} placeholder="Description" value={milestoneForm.description} onChange={(e) => setMilestoneForm((p) => ({ ...p, description: e.target.value }))} />
                <textarea style={{ ...inp, minHeight: 70 }} placeholder="Parent note (optional)" value={milestoneForm.parent_note} onChange={(e) => setMilestoneForm((p) => ({ ...p, parent_note: e.target.value }))} />
                <input style={inp} type="date" value={milestoneForm.date_achieved} onChange={(e) => setMilestoneForm((p) => ({ ...p, date_achieved: e.target.value }))} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={btnNeutral} onClick={() => { setShowAddMilestone(false); setEditingMilestone(null); resetMilestoneForm(); }} disabled={savingId === "milestone-add" || savingId === `milestone-${editingMilestone?.id}`}>Cancel</button>
                <button style={btnGreen} onClick={saveMilestone} disabled={savingId === "milestone-add" || savingId === `milestone-${editingMilestone?.id}`}>{savingId === "milestone-add" || savingId === `milestone-${editingMilestone?.id}` ? "Saving..." : "Save Milestone"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Activity modal */}
        {(showAddActivity || editingActivity) && (
          <div style={overlay}>
            <div style={modalCard}>
              <div style={{ ...sectionTitle, marginBottom: 16 }}>{editingActivity ? "Edit Activity" : "Add Activity"}</div>
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <input style={inp} placeholder="Title" value={activityForm.title} onChange={(e) => setActivityForm((p) => ({ ...p, title: e.target.value }))} />
                <textarea style={{ ...inp, minHeight: 84 }} placeholder="Description" value={activityForm.description} onChange={(e) => setActivityForm((p) => ({ ...p, description: e.target.value }))} />
                <input style={inp} placeholder="Age band (e.g. Age 3-4)" value={activityForm.age} onChange={(e) => setActivityForm((p) => ({ ...p, age: e.target.value }))} />
                <input style={inp} placeholder="Duration (e.g. 15 min)" value={activityForm.duration} onChange={(e) => setActivityForm((p) => ({ ...p, duration: e.target.value }))} />
                <select style={inp} value={activityForm.domain} onChange={(e) => setActivityForm((p) => ({ ...p, domain: e.target.value }))}>
                  {ACTIVITY_DOMAINS.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
                </select>
                <select style={inp} value={activityForm.milestone} onChange={(e) => setActivityForm((p) => ({ ...p, milestone: e.target.value }))}>
                  <option value="">No linked milestone</option>
                  {milestones.map((m) => <option key={m.id} value={m.id}>{m.title} (#{m.id})</option>)}
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={btnNeutral} onClick={() => { setShowAddActivity(false); setEditingActivity(null); resetActivityForm(); }} disabled={savingId === "activity-add" || savingId === `activity-${editingActivity?.id}`}>Cancel</button>
                <button style={btnGreen} onClick={saveActivity} disabled={savingId === "activity-add" || savingId === `activity-${editingActivity?.id}`}>{savingId === "activity-add" || savingId === `activity-${editingActivity?.id}` ? "Saving..." : "Save Activity"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Resource modal */}
        {(showAddResource || editingResource) && (
          <div style={overlay}>
            <div style={modalCard}>
              <div style={{ ...sectionTitle, marginBottom: 16 }}>{editingResource ? "Edit E-Library Resource" : "Add E-Library Resource"}</div>
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <input style={inp} placeholder="Title" value={resourceForm.title} onChange={(e) => setResourceForm((p) => ({ ...p, title: e.target.value }))} />
                <select style={inp} value={resourceForm.resource_type} onChange={(e) => setResourceForm((p) => ({ ...p, resource_type: e.target.value }))}>
                  {RESOURCE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <select style={inp} value={resourceForm.category} onChange={(e) => setResourceForm((p) => ({ ...p, category: e.target.value }))}>
                  {RESOURCE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <textarea style={{ ...inp, minHeight: 84 }} placeholder="Description" value={resourceForm.description} onChange={(e) => setResourceForm((p) => ({ ...p, description: e.target.value }))} />
                <input
                  style={inp}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setResourceForm((p) => ({
                      ...p,
                      image_file: file,
                      image_preview: file ? URL.createObjectURL(file) : p.image_preview,
                    }));
                  }}
                />
                {resourceForm.image_preview && (
                  <img
                    src={resourceForm.image_preview}
                    alt="Resource preview"
                    style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                )}
                <input style={inp} placeholder="Source URL (optional)" value={resourceForm.file_url} onChange={(e) => setResourceForm((p) => ({ ...p, file_url: e.target.value }))} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={btnNeutral} onClick={() => { setShowAddResource(false); setEditingResource(null); resetResourceForm(); }} disabled={savingId === "resource-add" || savingId === `resource-${editingResource?.id}`}>Cancel</button>
                <button style={btnGreen} onClick={saveResource} disabled={savingId === "resource-add" || savingId === `resource-${editingResource?.id}`}>{savingId === "resource-add" || savingId === `resource-${editingResource?.id}` ? "Saving..." : "Save Resource"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Follow-up modal */}
        {(showAddFollowUp || editingFollowUp) && (
          <div style={overlay}>
            <div style={modalCard}>
              <div style={{ ...sectionTitle, marginBottom: 16 }}>{editingFollowUp ? "Edit Follow-up Message" : "Add Follow-up Message"}</div>
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <select
                  style={inp}
                  value={followUpForm.milestone}
                  onChange={(e) => {
                    const milestoneId = e.target.value;
                    const autoChildId = getChildIdForMilestone(milestoneId);
                    const autoParentName = getParentNameForMilestone(milestoneId);
                    setFollowUpForm((p) => ({
                      ...p,
                      child: autoChildId,
                      milestone: milestoneId,
                      parent_name: autoParentName || p.parent_name,
                    }));
                  }}
                >
                  <option value="">Select milestone</option>
                  {milestones.map((m) => <option key={m.id} value={m.id}>{m.title} ({childrenMap[m.child]?.name || `Child #${m.child}`})</option>)}
                </select>
                <input style={inp} placeholder="Parent name" value={followUpForm.parent_name} onChange={(e) => setFollowUpForm((p) => ({ ...p, parent_name: e.target.value }))} />
                <textarea style={{ ...inp, minHeight: 90 }} placeholder="Message" value={followUpForm.message} onChange={(e) => setFollowUpForm((p) => ({ ...p, message: e.target.value }))} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button style={btnNeutral} onClick={() => { setShowAddFollowUp(false); setEditingFollowUp(null); resetFollowUpForm(); }} disabled={savingId === "followup-add" || savingId === `followup-${editingFollowUp?.id}`}>Cancel</button>
                <button style={btnGreen} onClick={saveFollowUp} disabled={savingId === "followup-add" || savingId === `followup-${editingFollowUp?.id}`}>{savingId === "followup-add" || savingId === `followup-${editingFollowUp?.id}` ? "Saving..." : "Save Follow-up"}</button>
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
                  else if (confirmDelete.type === "milestone") deleteMilestone(confirmDelete.id, confirmDelete.label);
                  else if (confirmDelete.type === "activity") deleteActivity(confirmDelete.id, confirmDelete.label);
                  else if (confirmDelete.type === "resource") deleteResource(confirmDelete.id, confirmDelete.label);
                  else if (confirmDelete.type === "followup") deleteFollowUp(confirmDelete.id);
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