import styles from './page.module.css';
import VendorList from './components/VendorList';

export default function Home() {
  return (
    <main>
      <h1>Software Checkout Admin Panel</h1>
      <VendorList />
    </main>
  );
}
