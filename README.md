# Github to Freshdesk

Steps on how to run the program

## Installation

If you dont have installed npm and node.js start with them

Installing GithubToFreshdesk with npm

```bash
mkdir GithubToFreshdesk
cd GithubToFreshdesk
npm init -y
```

After successfuly creating the folder you can download the files and put them there

You will need to have the following files:

- .env
- index.js

You can either change the tokens in the .env file or use the already created ones.

Other needed libraries before running the project are:

```bash
npm install dotenv //load environment variables from a .env file
npm install node-fetch //perform HTTP requests
```

You are ready to run the project by typing in the terminal

```bash
node index.js <github_user> <freshdesk_subdomain>
```
