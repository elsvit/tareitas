import { Redirect } from 'expo-router';

export default function AccountLogin() {
  return <Redirect href="/(onboarding)?setup=1" />;
}
