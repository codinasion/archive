import core from "@actions/core";

import fetch from "node-fetch";

import fs from "fs";

import getScreenshot from "./chromium.js";

export default async function clickGithubUsernameGet(
  BACKEND_URL,
  BACKEND_ACCESS_TOKEN,
  TOKEN,
  SPECIAL = false
) {
  try {
    // Get username from backend to click
    if (SPECIAL) {
      var response = await fetch(
        `${BACKEND_URL}/archive/github/users/click/special/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${BACKEND_ACCESS_TOKEN}`,
          },
        }
      );
    } else {
      var response = await fetch(`${BACKEND_URL}/archive/github/users/click/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${BACKEND_ACCESS_TOKEN}`,
        },
      });
    }

    if (response.status !== 200) {
      throw new Error(
        `Backend API call failed with status code ${response.status}`
      );
    }

    const users = await response.json();

    for (let user of users) {
      // Check if user exists !!!
      await console.log(`Checking if ${user.login} exists...`);
      const userResponse = await fetch(
        `https://api.github.com/users/${user.login}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (userResponse.status !== 200) {
        await console.log(`User ${user.login} does not exist.`);

        // Mark user as fetch_error
        const patchResponse = await fetch(
          `${BACKEND_URL}/archive/github/users/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${BACKEND_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              login: user.login,
              id: user.id,
            }),
          }
        );

        if (
          patchResponse.status !== 202 &&
          patchResponse.status !== 201 &&
          patchResponse.status !== 200
        ) {
          await console.log(patchResponse.status);
          throw new Error("Failed to patch data to backend");
        }

        await console.log("Posted to backend");

        core.setOutput("available_to_click", "false");

        return;
      }

      // Click user
      await console.log(`Clicking ${user.login}...`);

      let image_folder = `images`;
      fs.mkdirSync(image_folder, { recursive: true });

      await console.log(`Creating screenshot...`);
      let image_path = `${image_folder}/${user.login}.png`;
      await getScreenshot({
        url: `https://github.com/${user.login}`,
        filePath: image_path,
      });

      core.setOutput("userid", user.id);
      core.setOutput("username", user.login);
      core.setOutput("available_to_click", "true");
    }

    // End of action
  } catch (err) {
    core.setFailed(err.message);
  }
}
