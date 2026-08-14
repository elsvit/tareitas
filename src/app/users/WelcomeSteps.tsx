import { Redirect } from 'expo-router';

export default function WelcomeStepsRedirect() {
  return <Redirect href="/(onboarding)" />;
}
