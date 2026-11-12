import LegalPage from './LegalPage';

const sections = [
  { h: 'What we collect', p: 'Today the site stores your favourites and the artists you follow in your own browser (localStorage). That data never leaves your device. When accounts launch, we will collect the email, display name and profile details you provide, plus the artwork you upload.' },
  { h: 'How we use it', p: 'Account details are used to sign you in and show your profile. Uploaded artwork is shown publicly only after a curator approves it. We do not sell personal data.' },
  { h: 'Cookies and storage', p: 'We use browser storage for your favourites and to remember that the loading screen has played. We do not use advertising cookies.' },
  { h: 'Third-party services', p: 'Fonts are loaded from Google Fonts. When accounts launch, authentication and storage are provided by Supabase.' },
  { h: 'Your choices', p: 'You can clear your favourites any time by clearing site data in your browser. When accounts launch you will be able to edit or delete your profile and artwork.' },
  { h: 'Contact', p: 'Questions about privacy? Use the Contact page.' },
];

export default function Privacy() {
  return <LegalPage title="Privacy policy." seoTitle="Privacy Policy" description="How CodedByAli OpenMuseum handles your data." updated="November 2026" sections={sections} />;
}
