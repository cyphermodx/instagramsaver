Instagram Saver (static site)
Front end for the Canva design: Home, Upcoming Updates, About Us.
Plain HTML/CSS/JS, so it needs no build step.
Files
`index.html`: home page with the downloader box, FAQ and info sections
`updates.html`, `about.html`: the other two pages
`style.css`: all styling
`script.js`: link validation, Video/Audio switch, and the call to your download service
`favicon.svg`: browser tab icon
Before you publish
In `about.html`, replace `your-email@example.com` with your real email (appears in the Contact link).
Review the text on all pages and edit anything that isn't true for your service.
Publish on GitHub
Create a repository on github.com (for example `instagram-saver`).
Click Add file → Upload files, drag in everything from this folder (not the folder itself), and commit.
Deploy on Cloudflare Pages (free)
In the Cloudflare dashboard go to Workers & Pages → Create → Pages → Connect to Git.
Pick your repository.
Framework preset: None. Build command: leave empty. Build output directory: `/`.
Click Save and Deploy. You get an address like `instagram-saver.pages.dev`.
Every push to GitHub redeploys automatically.
Optional: Custom domains in the Pages project to connect your own domain.
Connecting the download button
This site is only the front end. Static hosting cannot fetch reels by itself, so
`script.js` has a setting at the top:
    const API_ENDPOINT = "";

Until you set it, the Download button shows "The download service isn't connected yet."
Visitors will see that message, so connect a service before you share the site.
When you set it, the site sends:
    POST <API_ENDPOINT>
    { "url": "https://www.instagram.com/reel/..." }

and expects JSON back (all `https` URLs):
    {
      "title": "Reel caption",
      "author": "username",
      "thumbnail": "https://...",
      "videoUrl": "https://...",
      "audioUrl": "https://..."
    }

Use HTTP 404 when the reel can't be found. The service must allow requests from your
site's address (CORS).
Things to know
Instagram has no public API for downloading arbitrary reels, and downloading through
third-party tools goes against Instagram's terms. Hosts such as GitHub and Cloudflare
can suspend sites that receive copyright or terms-of-service complaints.
Keep the disclaimers on the pages and respond to takedown requests.
The Canva testimonials were left out on purpose: showing invented reviews as real
can cause legal and ad-network problems. Add real ones later.
