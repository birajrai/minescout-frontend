export function Footer() {
  return (
    <footer className="bg-stone-300/50 dark:bg-stone-900/50 border-t border-stone-300 dark:border-stone-700 pb-24">
      <div className="wrapper p-4 py-12 text-sm text-stone-500 dark:text-stone-400">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <a href="/" className="w-fit flex items-center">
              <img src="/brand/minescout-logo.png" alt="Minescout logo" className="h-8 w-auto max-w-[140px] object-contain object-left" width="140" height="32" decoding="async" />
            </a>
            <p className="max-w-md leading-relaxed">Minescout is a Minecraft Server List that helps you find the best Minecraft servers and vote for your most popular MC server.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            <div className="footer-link-wrapper">
              <span className="font-minecraft text-lg">Explore</span>
              <div className="flex flex-col gap-2">
                <a className="footer-link" href="/pages/about">About Minescout</a>
                <a className="footer-link" href="/blog">Blog</a>
                <a className="footer-link" href="/realms">Realms</a>
                <a className="footer-link" href="/tags">Tags</a>
                <a className="footer-link" href="/pages/glossary">Glossary</a>
                <a className="footer-link" href="/stats">Stats</a>
                <a className="footer-link" href="/pages/are-minecraft-servers-down">Minecraft &amp; auth status</a>
              </div>
            </div>
            <div className="footer-link-wrapper">
              <span className="font-minecraft text-lg">Guides</span>
              <div className="flex flex-col gap-2">
                <a className="footer-link" href="/blog/how-to-make-a-minecraft-server">How to make a server</a>
                <a className="footer-link" href="/blog/how-to-join-a-minecraft-server">How to join a server</a>
                <a className="footer-link" href="/blog/how-to-make-a-modded-minecraft-server">Modded server guide</a>
                <a className="footer-link" href="/blog/how-to-get-more-players-on-a-minecraft-server">How to get more players</a>
                <a className="footer-link" href="/pages/free-minecraft-hosting">Free Minecraft hosting</a>
              </div>
            </div>
            <div className="footer-link-wrapper">
              <span className="font-minecraft text-lg">Legal</span>
              <div className="flex flex-col gap-2">
                <a className="footer-link" href="/pages/terms-of-service">Terms of Service</a>
                <a className="footer-link" href="/pages/privacy-policy">Privacy Policy</a>
                <a className="footer-link" href="/pages/cookie-policy">Cookie Policy</a>
                <a className="footer-link" href="/pages/editorial-policy">Editorial Policy</a>
                <button type="button" className="footer-link text-left bg-transparent border-0 p-0 cursor-pointer font-inherit">Cookie settings</button>
              </div>
            </div>
            <div className="footer-link-wrapper">
              <span className="font-minecraft text-lg">Contact</span>
              <div className="flex flex-col gap-2">
                <a className="footer-link" href="/pages/support">support@minescout.bond</a>
                <a className="footer-link" href="/pages/support">Support form</a>
                <a className="footer-link" href="https://discord.gg/EV5hpQU8Z9" target="_blank" rel="noopener noreferrer">Discord</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-stone-300 dark:border-stone-700 pt-6 text-xs leading-relaxed">
            <p>© 2026 Minescout. All rights reserved.</p>
            <p>
              Minecraft and all associated Minecraft images are copyright of Mojang AB.
              <br />
              We are not affiliated with Minecraft or Mojang AB.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}