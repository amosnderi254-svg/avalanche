import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import EmptyState from '@/components/EmptyState';

export default function NotFound() {
  return (
    <>
      <Nav />
      <div className="container" style={{ padding: '20px 0 80px', maxWidth: 560 }}>
        <EmptyState
          iconPath="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          headline="This page does not exist"
          body="The link may have expired, the item may have been sold, or the address has a typo. Let us help you find what you need."
          actions={[
            {
              label: 'Browse all listings',
              variant: 'primary',
              href: '/',
            },
            {
              label: 'List an item - KSh 99',
              variant: 'secondary',
              href: '/sell',
            },
            {
              label: 'Share MyTinyverse',
              variant: 'ghost',
              whatsapp: true,
              externalHref: `https://wa.me/?text=${encodeURIComponent('Hey! I found MyTinyverse - a marketplace for parents to buy, sell and donate gently used kids\' items in Kenya. Check it out: https://mytinyverse.co.ke')}`,
            },
          ]}
          chips={[
            {
              label: 'Bikes',
              iconPath: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4l3 3',
              href: '/?category=bikes',
            },
            {
              label: 'Strollers',
              iconPath: 'M3 3h18v4H3zM12 7v14M5 21h14',
              href: '/?category=strollers',
            },
            {
              label: 'Shoes',
              iconPath: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z',
              href: '/?category=shoes',
            },
            {
              label: 'Toys',
              iconPath: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
              href: '/?category=toys',
            },
            {
              label: 'Books',
              iconPath: 'M4 19.5A2.5 2.5 0 016.5 17H20',
              href: '/?category=books',
            },
          ]}
          chipsLabel="Browse by category:"
        />
      </div>
      <Footer />
    </>
  );
}
