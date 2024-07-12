import("node-fetch")
  .then(({ default: fetch }) => {
    require("dotenv").config();

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const FRESHDESK_TOKEN = process.env.FRESHDESK_TOKEN;

    async function getGitHubUser(username) {
      const url = `https://api.github.com/users/${username}`;
      const headers = {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "User-Agent": "GitHub-User-Agent",
      };

      try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
          throw new Error(
            `GitHub API returned ${response.status} ${response.statusText}`
          );
        }

        return await response.json();
      } catch (error) {
        throw new Error(
          `Failed to fetch GitHub user ${username}: ${error.message}`
        );
      }
    }

    async function listFreshdeskContacts(subdomain) {
      const url = `https://${subdomain}.freshdesk.com/api/v2/contacts`;
      const headers = {
        Authorization: `Basic ${Buffer.from(FRESHDESK_TOKEN).toString(
          "base64"
        )}`,
        "Content-Type": "application/json",
      };

      try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
          throw new Error(
            `Freshdesk API returned ${response.status} ${response.statusText}`
          );
        }

        return await response.json();
      } catch (error) {
        throw new Error(`Failed to list Freshdesk contacts: ${error.message}`);
      }
    }

    async function createOrUpdateFreshdeskContact(subdomain, githubUser) {
      try {
        const contacts = await listFreshdeskContacts(subdomain);

        const existingContact = contacts.find(
          (contact) => contact.name === githubUser.name
        );

        const url = `https://${subdomain}.freshdesk.com/api/v2/contacts`;
        const headers = {
          Authorization: `Basic ${Buffer.from(FRESHDESK_TOKEN).toString(
            "base64"
          )}`,
          "Content-Type": "application/json",
        };

        let response;
        let contactData = {
          name: githubUser.name,
          email:
            githubUser.email ||
            `${githubUser.name.split(" ").join(".")}@example.com`,
          job_title: githubUser.bio || "programmer",
          twitter_id: githubUser.twitter_username,
          description: githubUser.bio,
          company_id: githubUser.company,
          phone: githubUser.phone || null,
          mobile: githubUser.mobile || null,
          address: githubUser.location || "No address provided",
        };

        if (existingContact) {
          response = await fetch(`${url}/${existingContact.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(contactData),
          });
        } else {
          response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(contactData),
          });
        }

        if (!response.ok) {
          throw new Error(
            `Failed to create/update Freshdesk contact: ${response.status} ${response.statusText}`
          );
        }

        return await response.json();
      } catch (error) {
        throw new Error(
          `Failed to create/update Freshdesk contact: ${error.message}`
        );
      }
    }

    async function main() {
      const [, , githubUsername, freshdeskSubdomain] = process.argv;

      if (!githubUsername || !freshdeskSubdomain) {
        console.error(
          "Usage: node index.js <github_username> <freshdesk_subdomain>"
        );
        process.exit(1);
      }

      try {
        const githubUser = await getGitHubUser(githubUsername);
        console.log("GitHub User:", githubUser);

        const freshdeskContact = await createOrUpdateFreshdeskContact(
          freshdeskSubdomain,
          githubUser
        );
        console.log("Freshdesk Contact:", freshdeskContact);
      } catch (error) {
        console.error("Error:", error.message);
      }
    }

    main();
  })
  .catch((error) => {
    console.error("Error importing node-fetch:", error.message);
  });
