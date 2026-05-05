#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const ROOT = process.cwd();
const OUTPUT_FILE = path.join(ROOT, "docs", "marketing-plan-agent-output.md");

const DEFAULTS = {
  businessName: "DocBooking",
  city: "Panipat",
  audience: "patients and doctors",
  goal: "increase patient bookings and onboard doctors",
  budget: "free only",
  timeframe: "30 days",
  specialtyFocus: "all available specialties",
  assets: "website, doctor listing pages, WhatsApp OTP flow, local SEO pages",
  constraints: "keep it practical, low cost, and compliant for healthcare",
};

function hasFlag(flag) {
  return process.argv.slice(2).includes(flag);
}

function printHelp() {
  console.log(`
Local Marketing Agent

Usage:
  npm run marketing-agent
  npm run marketing-agent -- --defaults
  npm run marketing-agent -- --defaults --no-ollama

Modes:
  interactive  Ask questions and generate a marketing plan.
  --defaults   Generate a DocBooking Panipat plan immediately.
  --no-ollama  Skip local Ollama and use the built-in free planner.

Optional:
  OLLAMA_MODEL=llama3.2 npm run marketing-agent

If Ollama is running locally, the agent will use it. Otherwise it uses the
built-in free planner and writes the plan to docs/marketing-plan-agent-output.md.
`);
}

function clean(value, fallback) {
  const trimmed = String(value || "").trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
    console.log("\nLocal Marketing Agent for DocBooking");
    console.log("Press Enter to accept the default in brackets.\n");

    const answers = {};

    answers.businessName = clean(
      await rl.question(`Business name [${DEFAULTS.businessName}]: `),
      DEFAULTS.businessName
    );
    answers.city = clean(
      await rl.question(`Target city [${DEFAULTS.city}]: `),
      DEFAULTS.city
    );
    answers.audience = clean(
      await rl.question(`Audience [${DEFAULTS.audience}]: `),
      DEFAULTS.audience
    );
    answers.goal = clean(
      await rl.question(`Main goal [${DEFAULTS.goal}]: `),
      DEFAULTS.goal
    );
    answers.budget = clean(
      await rl.question(`Budget [${DEFAULTS.budget}]: `),
      DEFAULTS.budget
    );
    answers.timeframe = clean(
      await rl.question(`Timeframe [${DEFAULTS.timeframe}]: `),
      DEFAULTS.timeframe
    );
    answers.specialtyFocus = clean(
      await rl.question(`Specialty focus [${DEFAULTS.specialtyFocus}]: `),
      DEFAULTS.specialtyFocus
    );
    answers.assets = clean(
      await rl.question(`Current assets [${DEFAULTS.assets}]: `),
      DEFAULTS.assets
    );
    answers.constraints = clean(
      await rl.question(`Constraints [${DEFAULTS.constraints}]: `),
      DEFAULTS.constraints
    );

    return answers;
  } finally {
    rl.close();
  }
}

function buildAgentPrompt(input) {
  return [
    "You are a local marketing strategist for an Indian healthcare appointment booking project.",
    "Create a practical marketing plan that can be executed by a small founder team without paid AI tools.",
    "",
    "Project context:",
    `- Business: ${input.businessName}`,
    `- City: ${input.city}`,
    `- Audience: ${input.audience}`,
    `- Goal: ${input.goal}`,
    `- Budget: ${input.budget}`,
    `- Timeframe: ${input.timeframe}`,
    `- Specialty focus: ${input.specialtyFocus}`,
    `- Current assets: ${input.assets}`,
    `- Constraints: ${input.constraints}`,
    "",
    "Return markdown with these exact sections:",
    "1. Positioning",
    "2. Channel Strategy",
    "3. Weekly Action Plan",
    "4. WhatsApp Scripts",
    "5. Doctor Outreach Scripts",
    "6. Local SEO Tasks",
    "7. Content Calendar",
    "8. Metrics",
    "9. Today Checklist",
    "",
    "Keep recommendations specific to local healthcare marketing, doctor onboarding, OPD booking, WhatsApp, and local SEO.",
  ].join("\n");
}

async function getOllamaModel() {
  try {
    if (hasFlag("--no-ollama")) {
      return null;
    }

    if (process.env.OLLAMA_MODEL) {
      return process.env.OLLAMA_MODEL;
    }

    const response = await fetch("http://127.0.0.1:11434/api/tags", {
      signal: AbortSignal.timeout(1200),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.models?.[0]?.name || null;
  } catch {
    return null;
  }
}

async function generateWithOllama(prompt, model) {
  const response = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.4,
        num_ctx: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

function list(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function fallbackPlan(input) {
  const citySlug = slug(input.city);
  const specialty = input.specialtyFocus;

  return [
    `# ${input.businessName} Local Marketing Agent Plan`,
    "",
    `Generated for ${input.city} with a ${input.timeframe} execution window.`,
    "",
    "## 1. Positioning",
    "",
    `${input.businessName} should be positioned as the easiest way for ${input.audience} in ${input.city} to ${input.goal}. The message should lead with trust, then convenience, then proof.`,
    "",
    "Primary promise:",
    "",
    `> Book verified doctors in ${input.city} without standing in long OPD queues.`,
    "",
    "## 2. Channel Strategy",
    "",
    list([
      `Local SEO: build and improve pages around doctor appointment ${citySlug}, OPD booking ${citySlug}, and specialty pages for ${specialty}.`,
      "WhatsApp: use opt-in broadcasts for booking reminders, doctor onboarding follow-ups, and patient education.",
      "Doctor outreach: visit clinics directly with a free early listing pitch and publish each confirmed profile quickly.",
      "Google Business Profile: post weekly doctor availability, clinic areas, and patient FAQs.",
      "Social proof: turn every listed doctor into one website update, one Instagram post, and one WhatsApp message.",
    ]),
    "",
    "## 3. Weekly Action Plan",
    "",
    "### Week 1: Foundation",
    "",
    list([
      "Finalize patient message and doctor message separately.",
      "Create a one-page doctor onboarding pitch.",
      "Make sure every doctor profile has name, specialty, fee, address, timings, and booking CTA.",
      "Prepare a simple clinic QR poster that links to the doctor or booking page.",
    ]),
    "",
    "### Week 2: Local Visibility",
    "",
    list([
      `Publish or improve local pages for ${input.city} and the most important specialties.`,
      "Post 5 local updates: problem, doctor spotlight, patient guide, doctor listing invite, weekly availability.",
      "Reach out to 20 clinics or doctors and capture objections in a simple spreadsheet.",
    ]),
    "",
    "### Week 3: Conversion",
    "",
    list([
      "Improve CTAs near doctor cards and appointment selection.",
      "Send WhatsApp reminders only to opted-in contacts.",
      "Ask every booked patient what nearly stopped them from booking.",
      "Convert the top three objections into FAQ answers.",
    ]),
    "",
    "### Week 4: Repeat System",
    "",
    list([
      "Double down on the two channels that produced replies or bookings.",
      "Create a repeatable doctor onboarding checklist.",
      "Publish one result update: doctors listed, specialties available, and successful bookings.",
      "Set next-month goals for doctors onboarded, bookings, and WhatsApp opt-ins.",
    ]),
    "",
    "## 4. WhatsApp Scripts",
    "",
    "Patient message:",
    "",
    `Hi, ${input.businessName} helps you book verified doctor appointments in ${input.city} without waiting in long OPD queues. Choose a doctor, pick a slot, and visit on time. Book your slot today: [link]`,
    "",
    "Follow-up message:",
    "",
    `Need help finding the right doctor in ${input.city}? Reply with your concern or preferred specialty and we will guide you to available appointment slots.`,
    "",
    "## 5. Doctor Outreach Scripts",
    "",
    "First message:",
    "",
    `Hello Doctor, ${input.businessName} is onboarding trusted doctors in ${input.city} with free early listing. We can create your profile with OPD timings, fees, clinic location, and booking link. May I collect your clinic details?`,
    "",
    "Clinic visit pitch:",
    "",
    "We help patients choose a slot before they arrive, which can reduce phone calls and waiting-room crowding. Early listing is free, and the clinic controls timings and availability.",
    "",
    "## 6. Local SEO Tasks",
    "",
    list([
      `Add internal links from the homepage to /doctors and key specialty pages for ${input.city}.`,
      "Add FAQs that answer real patient doubts about appointment timing, fees, cancellation, and clinic location.",
      "Create unique content for every specialty page instead of repeating the same paragraph.",
      "Add doctor profile details in consistent format: specialty, qualification, experience, fee, address, timings.",
      "Submit sitemap after new pages are published.",
    ]),
    "",
    "## 7. Content Calendar",
    "",
    list([
      `Monday: How to avoid OPD waiting time in ${input.city}.`,
      "Tuesday: Doctor spotlight with specialty, clinic area, and booking link.",
      "Wednesday: Patient checklist before visiting a clinic.",
      "Thursday: Free early listing invitation for doctors.",
      "Friday: Available specialties and appointment slots roundup.",
      "Saturday: Clinic FAQ or myth-busting post.",
      "Sunday: Review metrics and prepare next week's doctor outreach list.",
    ]),
    "",
    "## 8. Metrics",
    "",
    list([
      "Doctor profiles published",
      "Doctor outreach replies",
      "Clinic visits completed",
      "Doctor page visits",
      "Booking CTA clicks",
      "Completed bookings",
      "WhatsApp opt-ins",
      "Patient feedback after visit",
    ]),
    "",
    "## 9. Today Checklist",
    "",
    list([
      "Pick 10 clinics to contact today.",
      "Publish or improve 1 doctor profile.",
      "Write 1 patient WhatsApp message.",
      "Write 1 doctor onboarding message.",
      "Check top search pages and add one stronger booking CTA.",
      "Record every reply, objection, and booking in a simple tracker.",
    ]),
    "",
  ].join("\n");
}

async function savePlan(markdown) {
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, markdown, "utf8");
}

async function main() {
  const input = await askQuestions();
  const prompt = buildAgentPrompt(input);
  const model = await getOllamaModel();

  let markdown;
  let source;

  if (model) {
    try {
      console.log(`\nUsing local Ollama model: ${model}`);
      markdown = await generateWithOllama(prompt, model);
      source = `local Ollama model: ${model}`;
    } catch (error) {
      console.log(`\nOllama failed (${error.message}). Using built-in free planner.`);
      markdown = fallbackPlan(input);
      source = "built-in free planner";
    }
  } else {
    console.log("\nOllama is not running or no model is installed. Using built-in free planner.");
    markdown = fallbackPlan(input);
    source = "built-in free planner";
  }

  const finalMarkdown = [
    "<!-- Generated by scripts/marketing-agent.js -->",
    `<!-- Source: ${source} -->`,
    "",
    markdown.trim(),
    "",
  ].join("\n");

  await savePlan(finalMarkdown);

  console.log("\nMarketing plan created:");
  console.log(OUTPUT_FILE);
  console.log("\nOpen the file above or rerun with different answers anytime:");
  console.log("npm run marketing-agent");
}

main().catch((error) => {
  console.error("\nMarketing agent failed:");
  console.error(error);
  process.exit(1);
});
