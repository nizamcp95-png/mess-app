// Members (5 people, editable via UI)
let MEMBERS = ["Alice", "Bob", "Charlie", "David", "Eve"];
const STORAGE_KEY = "roomMessExpenses";
const MEMBERS_KEY = "roomMessMembers";

let expenses = [];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("expense-form");
  const memberSelect = document.getElementById("member");
  const amountInput = document.getElementById("amount");
  const categorySelect = document.getElementById("category");
  const descriptionInput = document.getElementById("description");
  const errorEl = document.getElementById("form-error");

  const membersForm = document.getElementById("members-form");
  const membersErrorEl = document.getElementById("members-error");

  loadMembersFromStorage();
  loadExpensesFromStorage();
  populateMembers(memberSelect);
  hydrateMembersForm();
  renderAll();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const member = memberSelect.value;
    const amountRaw = amountInput.value.trim();
    const category = categorySelect ? categorySelect.value : "";
    const description = descriptionInput.value.trim();

    const amount = parseFloat(amountRaw);

    if (!member) {
      errorEl.textContent = "Please select a member.";
      return;
    }

    if (!amountRaw || isNaN(amount) || amount <= 0) {
      errorEl.textContent = "Please enter a valid positive amount.";
      return;
    }

    const expense = {
      id: typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),
      member,
      amount,
      category: category || "General",
      description,
      timestamp: new Date().toISOString(),
    };

    expenses.push(expense);
    saveExpensesToStorage();
    renderAll();

    // Reset form and focus
    form.reset();
    memberSelect.value = "";
    if (categorySelect) categorySelect.value = "";
    amountInput.focus();
  });

  if (membersForm) {
    membersForm.addEventListener("submit", (e) => {
      e.preventDefault();
      membersErrorEl.textContent = "";

      const inputs = [];
      for (let i = 0; i < 5; i++) {
        const input = document.getElementById(`member-${i}`);
        if (input) inputs.push(input);
      }

      const newNames = inputs.map((inp) => inp.value.trim());

      if (newNames.some((n) => !n)) {
        membersErrorEl.textContent = "All 5 member names are required.";
        return;
      }

      const unique = new Set(newNames.map((n) => n.toLowerCase()));
      if (unique.size !== newNames.length) {
        membersErrorEl.textContent = "Member names must be unique.";
        return;
      }

      // Map old names to new names by index so existing expenses stay attached
      const oldMembers = [...MEMBERS];
      MEMBERS = [...newNames];
      saveMembersToStorage();

      // Update existing expenses with renamed members
      expenses = expenses.map((exp) => {
        const idx = oldMembers.indexOf(exp.member);
        if (idx !== -1) {
          return { ...exp, member: MEMBERS[idx] };
        }
        return exp;
      });
      saveExpensesToStorage();

      populateMembers(memberSelect);
      renderAll();
    });
  }
});

function loadMembersFromStorage() {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 5) {
      MEMBERS = parsed.map((n) => String(n || "").trim() || "Member");
    }
  } catch {
    // ignore and keep defaults
  }
}

function saveMembersToStorage() {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(MEMBERS));
}

// Populate dropdown from MEMBERS
function populateMembers(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML =
    '<option value="" disabled selected>Select member</option>';
  MEMBERS.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    selectEl.appendChild(opt);
  });
}

// Fill the manage-members form from MEMBERS
function hydrateMembersForm() {
  for (let i = 0; i < 5; i++) {
    const input = document.getElementById(`member-${i}`);
    if (input) {
      input.value = MEMBERS[i] || "";
    }
  }
}

function loadExpensesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      expenses = [];
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      expenses = parsed.map((e) => ({
        ...e,
        amount: Number(e.amount) || 0,
      }));
    } else {
      expenses = [];
    }
  } catch {
    expenses = [];
  }
}

function saveExpensesToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function calculateTotals() {
  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const perPerson = MEMBERS.length > 0 ? total / MEMBERS.length : 0;

  const perMemberTotals = {};
  MEMBERS.forEach((m) => (perMemberTotals[m] = 0));

  expenses.forEach((e) => {
    if (perMemberTotals[e.member] != null) {
      perMemberTotals[e.member] += e.amount || 0;
    }
  });

  return {
    total,
    perPerson,
    perMemberTotals,
  };
}

function renderAll() {
  const totals = calculateTotals();
  renderSummary(totals);
  renderMemberBalances(totals);
  renderExpensesList(expenses);
}

function renderSummary({ total, perPerson }) {
  const totalEl = document.getElementById("total-amount");
  const perPersonEl = document.getElementById("per-person");

  totalEl.textContent = formatCurrency(total);
  perPersonEl.textContent = formatCurrency(perPerson);
}

function renderMemberBalances({ perPerson, perMemberTotals }) {
  const list = document.getElementById("member-balances");
  list.innerHTML = "";

  MEMBERS.forEach((member) => {
    const paid = perMemberTotals[member] || 0;
    const diff = paid - perPerson;

    const li = document.createElement("li");

    const left = document.createElement("div");
    left.className = "member-left";

    const nameSpan = document.createElement("span");
    nameSpan.className = "member-name";
    nameSpan.textContent = member;

    const metaSpan = document.createElement("span");
    metaSpan.className = "member-meta";
    metaSpan.textContent = `Paid: ${formatCurrency(paid)} · Share: ${formatCurrency(
      perPerson
    )}`;

    const statusSpan = document.createElement("span");
    statusSpan.className = "member-status";

    if (Math.abs(diff) < 0.01) {
      statusSpan.textContent = "Settled";
      statusSpan.classList.remove("owes", "owed");
    } else if (diff > 0) {
      statusSpan.textContent = `Should receive ${formatCurrency(diff)}`;
      statusSpan.classList.add("owed");
      statusSpan.classList.remove("owes");
    } else {
      statusSpan.textContent = `Owes ${formatCurrency(-diff)}`;
      statusSpan.classList.add("owes");
      statusSpan.classList.remove("owed");
    }

    left.appendChild(nameSpan);
    left.appendChild(metaSpan);
    li.appendChild(left);
    li.appendChild(statusSpan);
    list.appendChild(li);
  });
}

function renderExpensesList(expensesArr) {
  const tbody = document.getElementById("expenses-body");
  const emptyState = document.getElementById("no-expenses");

  tbody.innerHTML = "";

  if (!expensesArr.length) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  expensesArr
    .slice()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .forEach((e) => {
      const tr = document.createElement("tr");

      const memberTd = document.createElement("td");
      memberTd.textContent = e.member;

      const categoryTd = document.createElement("td");
      categoryTd.textContent = e.category || "General";

      const descTd = document.createElement("td");
      descTd.textContent = e.description || "—";

      const amountTd = document.createElement("td");
      amountTd.className = "expense-amount";
      amountTd.textContent = formatCurrency(e.amount);

      const dateTd = document.createElement("td");
      dateTd.textContent = formatDate(e.timestamp);

      tr.appendChild(memberTd);
      tr.appendChild(categoryTd);
      tr.appendChild(descTd);
      tr.appendChild(amountTd);
      tr.appendChild(dateTd);

      tbody.appendChild(tr);
    });
}

function formatCurrency(value) {
  const v = Number(value) || 0;
  return `QAR ${v.toFixed(2)}`;
}

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

