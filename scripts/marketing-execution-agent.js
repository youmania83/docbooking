#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const ROOT = process.cwd();
const PLAN_FILE = path.join(ROOT, "docs", "marketing-plan-agent-output.md");
const OUTPUT_DIR = path.join(ROOT, "docs", "marketing-execution");

const DEFAULTS = {
  owner: "Founder",
  city: "Panipat",
  clinicTarget: "10",
  dailyHours: "2",
  startDate: new Date().toISOString().slice(0, 10),
};

function hasFlag(flag) {
  return process.argv.slice(2).includes(flag);
}

function clean(value, fallback) {
  const trimmed = String(value || "").trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

function printHelp() {
  console.log(`
Local Marketing Plan Execution Agent

Usage:
  npm run marketing-execution-agent
  npm run marketing-execution-agent -- --defaults

What it does:
  Reads docs/marketing-plan-agent-output.md when available.
  Creates execution files in docs/marketing-execution/.
  Generates daily tasks, trackers, WhatsApp scripts, outreach scripts, a content
  calendar, and a simple daily logging system.
`);
}

async function readPlan() {
  try {
    return await fs.readFile(PLAN_FILE, "utf8");
  } catch {
    return "";
  }
}

async function askQuestions() {
  if (hasFlag("--help") || hasFlag("-h")) {
    printHelp();
    process.exit(0);
  }

  if (hasFlag("--defaults")) {
    return { ...DEFAULTS };
  }

  const rl = readline.createInterface({ input, output });

  try {
    console.log("\nLocal Marketing Plan Execution Agent");
    console.log("Press Enter to accept the default in brackets.\n");

    return {
      owner: clean(await rl.question(`Execution owner [${DEFAULTS.owner}]: `), DEFAULTS.owner),
      city: clean(await rl.question(`Target city [${DEFAULTS.city}]: `), DEFAULTS.city),
      clinicTarget: clean(
        await rl.question(`Clinics/doctors to contact per week [${DEFAULTS.clinicTarget}]: `),
        DEFAULTS.clinicTarget
      ),
      dailyHours: clean(
        await rl.question(`Daily execution time in hours [${DEFAULTS.dailyHours}]: `),
        DEFAULTS.dailyHours
      ),
      startDate: clean(await rl.question(`Start date [${DEFAULTS.startDate}]: `), DEFAULTS.startDate),
    };
  } finally {
    rl.close();
  }
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildTasks(context) {
  return [
    ["ID", "Week", "Day", "Task", "Channel", "Owner", "Status", "Notes"],
    ["MKT-001", "1", "1", "Finalize patient promise and doctor promise", "Positioning", context.owner, "Todo", ""],
    ["MKT-002", "1", "1", "Create list of 10 priority clinics or doctors", "Outreach", context.owner, "Todo", ""],
    ["MKT-003", "1", "2", "Improve one doctor profile with fee, address, timings, and CTA", "Website", context.owner, "Todo", ""],
    ["MKT-004", "1", "2", "Create clinic QR poster copy", "Offline", context.owner, "Todo", ""],
    ["MKT-005", "1", "3", "Send first doctor onboarding WhatsApp messages", "WhatsApp", context.owner, "Todo", ""],
    ["MKT-006", "1", "4", "Publish one patient FAQ update", "SEO", context.owner, "Todo", ""],
    ["MKT-007", "1", "5", "Post doctor spotlight content", "Social", context.owner, "Todo", ""],
    ["MKT-008", "2", "1", `Visit or call ${context.clinicTarget} clinics/doctors`, "Outreach", context.owner, "Todo", ""],
    ["MKT-009", "2", "2", `Improve local SEO copy for doctor appointment in ${context.city}`, "SEO", context.owner, "Todo", ""],
    ["MKT-010", "2", "3", "Send patient booking reminder to opted-in contacts", "WhatsApp", context.owner, "Todo", ""],
    ["MKT-011", "2", "4", "Capture objections from doctors and clinics", "Research", context.owner, "Todo", ""],
    ["MKT-012", "2", "5", "Turn objections into FAQ answers", "Website", context.owner, "Todo", ""],
    ["MKT-013", "3", "1", "Review doctor page visits and booking CTA clicks", "Metrics", context.owner, "Todo", ""],
    ["MKT-014", "3", "2", "Add stronger CTA to top doctor and specialty pages", "Conversion", context.owner, "Todo", ""],
    ["MKT-015", "3", "3", "Follow up with warm doctor leads", "Outreach", context.owner, "Todo", ""],
    ["MKT-016", "3", "4", "Ask booked patients for short feedback", "Trust", context.owner, "Todo", ""],
    ["MKT-017", "3", "5", "Publish weekly availability roundup", "Social", context.owner, "Todo", ""],
    ["MKT-018", "4", "1", "Identify top two channels by replies or bookings", "Metrics", context.owner, "Todo", ""],
    ["MKT-019", "4", "2", "Create repeatable doctor onboarding checklist", "Operations", context.owner, "Todo", ""],
    ["MKT-020", "4", "3", "Publish honest momentum update", "Trust", context.owner, "Todo", ""],
    ["MKT-021", "4", "4", "Set next-month targets", "Planning", context.owner, "Todo", ""],
  ];
}

function buildClinicTracker(context) {
  return [
    ["Clinic/Doctor", "Specialty", "Area", "Phone", "First Contact Date", "Status", "Objection", "Next Follow Up", "Profile Published", "Notes"],
    ["", "", context.city, "", context.startDate, "Not contacted", "", addDays(context.startDate, 2), "No", ""],
  ];
}

function buildMetricsTracker() {
  return [
    ["Date", "Doctor Profiles Published", "Clinics Contacted", "Doctor Replies", "Patient WhatsApp Opt-ins", "Doctor Page Visits", "Booking CTA Clicks", "Completed Bookings", "Notes"],
    [new Date().toISOString().slice(0, 10), "0", "0", "0", "0", "0", "0", "0", ""],
  ];
}

function buildContentCalendar(context) {
  const days = [
    ["Monday", `How to avoid OPD waiting time in ${context.city}`, "Patient education", "Instagram, WhatsApp, Google Business Profile"],
    ["Tuesday", "Doctor spotlight with specialty, clinic area, and booking link", "Trust", "Instagram, WhatsApp"],
    ["Wednesday", "Patient checklist before visiting a clinic", "Patient education", "Website FAQ, Social"],
    ["Thursday", "Free early listing invitation for doctors", "Doctor acquisition", "WhatsApp, Direct outreach"],
    ["Friday", "Available specialties and appointment slots roundup", "Conversion", "WhatsApp, Google Business Profile"],
    ["Saturday", "Clinic FAQ or myth-busting post", "Trust", "Website FAQ, Social"],
    ["Sunday", "Review metrics and prepare next week's outreach list", "Operations", "Internal"],
  ];

  return [
    ["Date", "Day", "Post Idea", "Goal", "Channel", "Status", "Link/Notes"],
    ...days.map((day, index) => [addDays(context.startDate, index), ...day, "Todo", ""]),
  ];
}

function buildTodayMarkdown(context) {
  return [
    "# Marketing Execution Today",
    "",
    `Date: ${context.startDate}`,
    `Owner: ${context.owner}`,
    `Daily time available: ${context.dailyHours} hours`,
    "",
    "## Priority Tasks",
    "",
    "- Pick 10 clinics or doctors to contact.",
    "- Publish or improve 1 doctor profile.",
    "- Send the first doctor onboarding message.",
    "- Write 1 patient WhatsApp booking message.",
    "- Add or improve 1 local SEO FAQ.",
    "- Record replies, objections, and bookings in the trackers.",
    "",
    "## Time Blocks",
    "",
    "- 30 min: Prepare clinic list and messages.",
    "- 45 min: Doctor or clinic outreach.",
    "- 30 min: Website or SEO improvement.",
    "- 15 min: Metrics and daily log.",
    "",
  ].join("\n");
}

function buildScriptsMarkdown(context) {
  return [
    "# Marketing Execution Scripts",
    "",
    "## Patient WhatsApp",
    "",
    `Hi, DocBooking helps you book verified doctor appointments in ${context.city} without waiting in long OPD queues. Choose a doctor, pick a slot, and visit on time. Book your slot today: [link]`,
    "",
    "## Patient Follow Up",
    "",
    `Need help finding the right doctor in ${context.city}? Reply with your concern or preferred specialty and we will guide you to available appointment slots.`,
    "",
    "## Doctor First Message",
    "",
    `Hello Doctor, DocBooking is onboarding trusted doctors in ${context.city} with free early listing. We can create your profile with OPD timings, fees, clinic location, and booking link. May I collect your clinic details?`,
    "",
    "## Clinic Visit Pitch",
    "",
    "We help patients choose a slot before they arrive, which can reduce phone calls and waiting-room crowding. Early listing is free, and the clinic controls timings and availability.",
    "",
    "## Objection Replies",
    "",
    "### We do not need online bookings",
    "",
    "That is okay. This is a free early listing to improve patient visibility and reduce unnecessary calls. You can start with only basic clinic details and available OPD timings.",
    "",
    "### Is there commission?",
    "",
    "The early listing is free. The goal right now is to help local patients discover verified doctors and book more easily.",
    "",
    "### Who manages timings?",
    "",
    "Your clinic controls OPD timings and availability. We only publish what you approve.",
    "",
  ].join("\n");
}

function buildRunbook(context, planText) {
  const planSource = planText ? "Read from docs/marketing-plan-agent-output.md" : "No plan file found; used default DocBooking execution template";

  return [
    "# Marketing Execution Agent Runbook",
    "",
    `Source: ${planSource}`,
    `Owner: ${context.owner}`,
    `City: ${context.city}`,
    `Weekly clinic/doctor target: ${context.clinicTarget}`,
    "",
    "## Files Created",
    "",
    "- today.md: immediate work for the day",
    "- task-board.csv: execution board",
    "- clinic-outreach-tracker.csv: doctor and clinic pipeline",
    "- metrics-tracker.csv: weekly growth numbers",
    "- content-calendar.csv: posts and channel plan",
    "- scripts.md: WhatsApp and outreach messages",
    "- daily-log.md: running notes",
    "",
    "## How To Run",
    "",
    "1. Open today.md and finish the priority tasks.",
    "2. Update task-board.csv as work moves from Todo to Done.",
    "3. Add every clinic or doctor conversation to clinic-outreach-tracker.csv.",
    "4. Update metrics-tracker.csv at the end of each day.",
    "5. Rerun this agent weekly to refresh execution files.",
    "",
  ].join("\n");
}

function buildDailyLog(context) {
  return [
    "# Marketing Daily Log",
    "",
    `## ${context.startDate}`,
    "",
    "### Completed",
    "",
    "- ",
    "",
    "### Replies And Objections",
    "",
    "- ",
    "",
    "### Bookings Or Leads",
    "",
    "- ",
    "",
    "### Tomorrow",
    "",
    "- ",
    "",
  ].join("\n");
}

async function writeFile(name, content) {
  await fs.writeFile(path.join(OUTPUT_DIR, name), content, "utf8");
}

async function main() {
  const context = await askQuestions();
  const planText = await readPlan();

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  await writeFile("today.md", buildTodayMarkdown(context));
  await writeFile("task-board.csv", toCsv(buildTasks(context)));
  await writeFile("clinic-outreach-tracker.csv", toCsv(buildClinicTracker(context)));
  await writeFile("metrics-tracker.csv", toCsv(buildMetricsTracker()));
  await writeFile("content-calendar.csv", toCsv(buildContentCalendar(context)));
  await writeFile("scripts.md", buildScriptsMarkdown(context));
  await writeFile("runbook.md", buildRunbook(context, planText));
  await writeFile("daily-log.md", buildDailyLog(context));

  console.log("\nMarketing execution workspace created:");
  console.log(OUTPUT_DIR);
  console.log("\nStart here:");
  console.log(path.join(OUTPUT_DIR, "today.md"));
  console.log("\nTrack work here:");
  console.log(path.join(OUTPUT_DIR, "task-board.csv"));
}

main().catch((error) => {
  console.error("\nMarketing execution agent failed:");
  console.error(error);
  process.exit(1);
});
