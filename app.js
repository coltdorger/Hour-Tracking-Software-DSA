const payRateForm = document.querySelector("#pay-rate-form");
const logForm = document.querySelector("#log-form");
const scheduleForm = document.querySelector("#schedule-form");
const payRateDisplay = document.querySelector("#pay-rate-display");
const weeklyPay = document.querySelector("#weekly-pay");
const monthlyPay = document.querySelector("#monthly-pay");
const logRows = document.querySelector("#log-rows");
const logTotal = document.querySelector("#log-total");
const scheduleRows = document.querySelector("#schedule-rows");
const scheduleTotal = document.querySelector("#schedule-total");
const exportBtn = document.querySelector("#export-btn");

let currentRate = 0;
let standardHours = 0;
const logs = [];
const schedules = [];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);

const formatHours = (value) => `${Number(value || 0).toFixed(2)} hrs`;

const updatePaySummary = () => {
  payRateDisplay.textContent = `${formatCurrency(currentRate)}/hr`;
  const weekly = currentRate * standardHours;
  weeklyPay.textContent = formatCurrency(weekly);
  monthlyPay.textContent = formatCurrency(weekly * 4.33);
};

const renderLogs = () => {
  logRows.innerHTML = "";
  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);
  logTotal.textContent = formatHours(totalHours);

  logs.forEach((log, index) => {
    const row = document.createElement("div");
    row.className = "table-row";
    const estPay = formatCurrency(log.hours * currentRate);

    row.innerHTML = `
      <span data-label="Date">${log.date}</span>
      <span data-label="Hours">${log.hours.toFixed(2)}</span>
      <span data-label="Notes">${log.notes || "—"}</span>
      <span data-label="Est. pay">${estPay}</span>
      <button type="button" data-index="${index}">Remove</button>
    `;
    logRows.appendChild(row);
  });
};

const renderSchedules = () => {
  scheduleRows.innerHTML = "";
  const totalHours = schedules.reduce((sum, schedule) => sum + schedule.hours, 0);
  scheduleTotal.textContent = formatHours(totalHours);

  schedules.forEach((schedule, index) => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.innerHTML = `
      <span data-label="Week of">${schedule.weekOf}</span>
      <span data-label="Hours">${schedule.hours.toFixed(2)}</span>
      <span data-label="Focus">${schedule.focus || "—"}</span>
      <button type="button" data-index="${index}">Remove</button>
    `;
    scheduleRows.appendChild(row);
  });
};

payRateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(payRateForm);
  currentRate = Number(formData.get("rate"));
  standardHours = Number(formData.get("standardHours"));
  updatePaySummary();
  payRateForm.reset();
});

logForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(logForm);
  const entry = {
    date: formData.get("date"),
    hours: Number(formData.get("hours")),
    notes: formData.get("notes").trim(),
  };
  logs.unshift(entry);
  renderLogs();
  logForm.reset();
});

scheduleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(scheduleForm);
  const entry = {
    weekOf: formData.get("weekOf"),
    hours: Number(formData.get("hours")),
    focus: formData.get("focus").trim(),
  };
  schedules.unshift(entry);
  renderSchedules();
  scheduleForm.reset();
});

logRows.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLButtonElement)) {
    return;
  }
  const index = Number(event.target.dataset.index);
  logs.splice(index, 1);
  renderLogs();
});

scheduleRows.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLButtonElement)) {
    return;
  }
  const index = Number(event.target.dataset.index);
  schedules.splice(index, 1);
  renderSchedules();
});

exportBtn.addEventListener("click", () => {
  const payload = {
    rate: currentRate,
    standardHours,
    logs,
    schedules,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hour-tracking-summary.json";
  link.click();
  URL.revokeObjectURL(url);
});

updatePaySummary();
renderLogs();
renderSchedules();
