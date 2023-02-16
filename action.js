import core from "@actions/core";

import scrapGithubUsernames from "./script/scrapGithubUsernames.js";
import clickGithubUsernameGet from "./script/clickGithubUsernameGet.js";
import clickGithubUsernamePost from "./script/clickGithubUsernamePost.js";

(async () => {
  try {
    await console.log("Hii there !!!");

    const OWNER = await core.getInput("OWNER");
    const REPO = await core.getInput("REPO");
    const TOKEN = await core.getInput("TOKEN");

    const USERID = await core.getInput("USERID");
    const USERNAME = await core.getInput("USERNAME");
    const IMAGE_BRANCH = await core.getInput("IMAGE_BRANCH");

    // Backend API data
    const BACKEND_URL = await core.getInput("BACKEND_URL");
    const BACKEND_ACCESS_TOKEN = await core.getInput("BACKEND_ACCESS_TOKEN");

    // Workflow Trigger Conditions
    const SCRAP_GITHUB_USERNAMES = await core.getInput(
      "SCRAP_GITHUB_USERNAMES"
    );

    const CLICK_GITHUB_USERNAME_GET = await core.getInput(
      "CLICK_GITHUB_USERNAME_GET"
    );

    const CLICK_GITHUB_USERNAME_POST = await core.getInput(
      "CLICK_GITHUB_USERNAME_POST"
    );

    if (SCRAP_GITHUB_USERNAMES === "true") {
      await scrapGithubUsernames(BACKEND_URL, BACKEND_ACCESS_TOKEN, TOKEN);
    }

    if (CLICK_GITHUB_USERNAME_GET === "true") {
      await clickGithubUsernameGet(BACKEND_URL, BACKEND_ACCESS_TOKEN, TOKEN);
    }

    if (CLICK_GITHUB_USERNAME_POST === "true") {
      await clickGithubUsernamePost(
        BACKEND_URL,
        BACKEND_ACCESS_TOKEN,
        OWNER,
        REPO,
        TOKEN,
        USERID,
        USERNAME,
        IMAGE_BRANCH
      );
    }

    // end of action
  } catch (e) {
    core.setFailed(`Action failed with "${e.message}"`);
  }
})();
