# Team workflow

Every change goes through a feature branch and a pull request, so each member's work shows up in the history under their own name.

## One-time setup (each member)

```bash
git clone https://github.com/sri-pranav-r/placehub.git
cd placehub
git config user.name "Your Name"
git config user.email "the-email-on-your-github-account@example.com"
npm run install-all
cp server/.env.example server/.env
```

Use the email of **your own** GitHub account, so your commits are credited to you.

## Making a change

1. Update `main` and create a branch named after the feature:
   ```bash
   git switch main
   git pull
   git switch -c feature/short-description     # e.g. feature/drive-search, fix/register-validation
   ```
2. Make the change and test it with `npm run dev`.
3. Run the checks:
   ```bash
   npm run check:ui
   ```
4. Commit in small steps with clear messages that say what changed and why:
   ```bash
   git add <files>
   git commit -m "Add branch filter to the drives page"
   ```
5. Push the branch and open a pull request on GitHub:
   ```bash
   git push -u origin feature/short-description
   ```
6. Another member reviews the pull request. Merge it into `main` once it is approved, then delete the branch.

## Rules

- Never commit `.env` files or API keys. They are listed in `.gitignore`.
- Do not push directly to `main`. Use a pull request.
- Keep each pull request to one feature or fix.
- Follow the UI rules in the README (`npm run check:ui` must pass).
