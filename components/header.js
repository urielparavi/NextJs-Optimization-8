import logo from '@/assets/logo.png';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  console.log(logo);

  return (
    <header id="main-header">
      <Link href="/">
        <Image
          src={logo}
          width={100}
          height={100}
          priority
          /*
          The 'priority' attribute disables lazy loading for this image,
          causing it to load immediately. This is useful for important
          images that are always visible above the fold — like logos or
          hero images — where fast loading improves perceived performance.
        */
          // sizes="10vw"
          alt="Mobile phone with posts feed on it"
          /* 
        The 'sizes' attribute tells the browser that this image
        will take up approximately 10% of the viewport width (10vw).
        This allows the browser to select the most appropriate
        image size from the 'srcset' for different screen widths,
        optimizing loading performance and ensuring the image
        looks good on all devices.
      */
        />
      </Link>
      <nav>
        <ul>
          <li>
            <Link href="/feed">Feed</Link>
          </li>
          <li>
            <Link className="cta-link" href="/new-post">
              New Post
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
