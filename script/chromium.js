import puppeteer from "puppeteer";

const default_width = 1366;
const default_height = 768;
const default_file_path = "screenshot.png";

export default async function getScreenshot(screenshot_data) {
  const {
    url,
    width = default_width,
    height = default_height,
    filePath = default_file_path,
  } = screenshot_data;

  // Create a browser instance
  await console.log("Launching browser...");
  const browser = await puppeteer.launch();

  // Create a new page
  await console.log("Creating new page...");
  const page = await browser.newPage();

  // Set viewport width and height
  await console.log("Setting viewport...");
  await page.setViewport({ width: width, height: height });

  // Open URL in current page
  await console.log(`Opening URL ${url} ...`);
  await page.goto(url, { waitUntil: "networkidle0" });

  // Wait for loading of all elements
  await console.log("Waiting for loading of all elements...");
  await page.waitForTimeout(5000);

  // Capture screenshot
  await console.log("Capturing screenshot...");
  await page.screenshot({
    path: filePath,
    fullPage: true,
  });

  // Close the browser instance
  await console.log("Closing browser...");
  await browser.close();

  return;
}

// // Test
// getScreenshot({
//   url: "https://github.com/github",
// });
