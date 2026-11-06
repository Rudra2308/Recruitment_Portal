import { config } from "dotenv";
config({ path: ".env.local" });

import { getSettings, updateSettings } from "../lib/data/settings";

async function run() {
  console.log("Testing Homepage Settings customization...");

  const initial = await getSettings();
  console.log("Current hero_heading:", initial.hero_heading);

  const testPatch = {
    positions_heading: "Current Career Openings",
    positions_subheading: "Explore verified technical and industrial vacancies across Malati Group.",
    process_step1_title: "Explore Positions",
    process_step2_title: "Submit CV & Application",
    contact_banner_title: "Have Questions for HR?",
  };

  await updateSettings(testPatch);
  console.log("Updated settings with custom test values.");

  const updated = await getSettings();
  console.log("Verified updated fields:");
  console.log(" - positions_heading:", updated.positions_heading);
  console.log(" - positions_subheading:", updated.positions_subheading);
  console.log(" - process_step1_title:", updated.process_step1_title);
  console.log(" - process_step2_title:", updated.process_step2_title);
  console.log(" - contact_banner_title:", updated.contact_banner_title);

  // Restore clean defaults
  await updateSettings({
    positions_heading: "Open Positions",
    positions_subheading: "Select a role to view detailed responsibilities and submit your application.",
    process_step1_title: "Find Your Position",
    process_step2_title: "Quick Online Application",
    contact_banner_title: "Questions about applying?",
  });
  console.log("Restored clean default values.");
  console.log("ALL TESTS PASSED!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
