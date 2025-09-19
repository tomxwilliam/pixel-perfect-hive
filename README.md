# 404 Code Lab - Complete Route Structure

## Project Overview
Professional website for 404 Code Lab with first-class routing, SEO optimization, and static hosting support.

## Complete Route Map

### Main Pages
- `/` - Homepage with hero section and services overview
- `/about` - About 404 Code Lab team and mission  
- `/contact` - Contact form and business information
- `/support` - Support center and ticket system

### Service Pages (SEO Optimized)
- `/services/web-development` - Custom website development
- `/services/app-development` - iOS & Android app development
- `/services/game-development` - Mobile game development  
- `/services/ai-integration` - AI integration services

### Portfolio Pages
- `/portfolio/web` - Web development showcase
- `/portfolio/apps` - Mobile app portfolio
- `/portfolio/games` - Game development portfolio (includes Beevers)

### Dashboard (Protected Routes)
- `/dashboard` - Customer portal
- `/dashboard/projects/new` - Project creation wizard
- `/dashboard/tickets/new` - Support ticket creation
- `/dashboard/book-call` - Consultation booking
- `/dashboard/chat` - AI assistant chat

### Admin (Staff Only)
- `/admin` - Admin dashboard with full CRM
- `/projects` - Project management system

### Legal Pages
- `/legal/privacy` - Privacy Policy
- `/legal/terms` - Terms of Service  
- `/legal/refunds` - Refund Policy
- `/legal/cookies` - Cookie Policy

## SEO Implementation
✅ All pages have unique titles, meta descriptions, canonical URLs  
✅ JSON-LD structured data where applicable
✅ Sitemap.xml with all routes
✅ Robots.txt for search engines
✅ Open Graph tags for social sharing

## Static Hosting Ready
✅ .htaccess (Apache), netlify.toml, vercel.json configured
✅ StaticNavigation uses `<a href>` for direct URL loading
✅ Footer converted to static links
✅ Hard refresh works on all routes

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS with design system
- Supabase backend + auth
- React Router for client-side navigation

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c7ad3d5c-c751-4109-9865-7f6982e63527) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c7ad3d5c-c751-4109-9865-7f6982e63527) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
