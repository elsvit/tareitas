import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { ScreenHeader } from '~/components/blocks';
import { SafeAreaBgImage } from '~/components/blocks/SafeAreaBackground/SafeAreaBgImage';
import { Button, ProgressBar } from '~/components/ui';
import { ButtonColors } from '~/components/ui/Button';
import { ChildForm } from '~/components/users/UserForm/ChildForm';
import { ParentForm } from '~/components/users/UserForm/ParentForm';
import { Welcome1, Welcome2, Welcome3 } from '~/components/welcomeSteps';
import { t } from '~/services';
import { addChild, clearChildren } from '~/store/children/slice';
import { addParent, clearParents } from '~/store/parents/slice';
import { ERole } from '~/store/settings/enums';
import { setCurrentRole, setCurrentUser } from '~/store/settings/slice';
import { Colors, spacing } from '~/styles';
import { EFormMode } from '~/types/ECommon';
import { ChildFormProps } from '~/types/IChild';
import { ParentFormProps } from '~/types/IParent';

export default function WelcomeSteps() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [isParentValid, setIsParentValid] = useState(false);
  const [parent, setParent] = useState<Partial<ParentFormProps>>({
    role: ERole.admin,
  });
  const [isChildValid, setIsChildValid] = useState(false);
  const [child, setChild] = useState<ChildFormProps>();
  // 5 Steps: 0: Welcome1, 1: Welcome2, 2: Welcome3, 3: ParentForm, 4: ChildForm
  const totalSteps = 5;
  const lastStep = totalSteps - 1;
  const progress = useMemo(() => (step / lastStep) * 100, [step, lastStep]);

  const onNext = () => {
    if (step < lastStep) {
      setStep(s => s + 1);
    } else {
      console.log("TEST_80 WelcomeSteps replace('/(tabs)/Tasks'");
      const parentId = uuidv4();
      const childId = uuidv4();
      if (parent.name && child?.name) {
        dispatch(clearParents());
        dispatch(
          addParent({
            entity: {
              ...parent,
              name: parent.name,
              role: ERole.admin,
              id: parentId,
              createdAt: new Date().toISOString(),
              createdBy: parentId,
            },
          }),
        );
        dispatch(clearChildren());
        dispatch(
          addChild({
            entity: {
              ...child,
              name: child.name,
              id: childId,
              createdAt: new Date().toISOString(),
              createdBy: parentId,
            },
          }),
        );
        dispatch(setCurrentUser(parentId));
        dispatch(setCurrentRole(ERole.admin));
        router.replace('/(tabs)/Tasks');
      }
    }
  };
  console.log('TEST_47 WelcomeSteps parent', parent);
  console.log('TEST_49 WelcomeSteps child', child);
  console.log('TEST_49 step', step);
  const onBack = () => {
    if (step === 0) {
      return;
    }
    setStep(s => s - 1);
  };

  const onParentSave = (value: ParentFormProps) => {
    console.log('TEST_56 parent save', value);
    setParent(value);
    setStep(s => s + 1);
  };

  const onChildSave = (value: ChildFormProps) => {
    console.log('TEST_62 child save', value);
    setChild(value);
    setStep(s => s + 1);
  };

  const isNextDisabled =
    (step === 3 && (!isParentValid || !parent.name)) ||
    (step === 4 && (!isChildValid || !child?.name));

  return (
    <SafeAreaBgImage>
      <ScreenHeader
        title={t('users.complete_your_profile')}
        containerStyle={styles.screenHeader}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar progress={progress} style={styles.progressBar} />
        {step === 0 && <Welcome1 />}
        {step === 1 && <Welcome2 />}
        {step === 2 && <Welcome3 />}
        {step === 3 && (
          <ParentForm
            title={t('users.add_parent')}
            mode={EFormMode.Add}
            parent={parent}
            onSave={onParentSave}
            onValidityChange={setIsParentValid}
            showScreenHeader={false}
          />
        )}
        {step === 4 && (
          <ChildForm
            title={t('users.add_child')}
            mode={EFormMode.Add}
            child={child}
            onSave={onChildSave}
            onValidityChange={setIsChildValid}
            showScreenHeader={false}
          />
        )}

        <View style={styles.footer}>
          {step > 0 ? (
            <Button
              mode="contained"
              onPress={onBack}
              bgColor={ButtonColors.Gray}
              style={styles.footerBtn}
            >
              {t('button.go_back') || 'Go Back'}
            </Button>
          ) : (
            <View />
          )}
          <Button
            mode="contained"
            onPress={onNext}
            style={styles.footerBtn}
            disabled={isNextDisabled}
          >
            {t('button.next') || 'Next'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaBgImage>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  container: {
    padding: spacing(4),
    paddingBottom: spacing(8),
    flexGrow: 1
  },
  progressBar: {
    height: 20,
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.orange300,
    marginTop: spacing(2),
  },
  footer: {
    flexDirection: 'row',
    gap: spacing(2),
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  footerBtn: {
    minWidth: 120,
  },
});
