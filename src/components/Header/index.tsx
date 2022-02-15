import styles from './header.module.scss'
import Link from 'next/link'
export default function Header() {
  return (

    <div className={styles.logo}>
      <Link href="/">
        <a>
          <img src="/images/Logo.svg" alt="logo" />
        </a>
      </Link>
    </div>
  )
}
