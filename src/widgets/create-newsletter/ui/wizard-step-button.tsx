"use client";

import { Button } from "@heroui/react";
import { useCallback, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useNewsletterFormStore } from "@/features/newsletter-form";
import { STEPS } from "../config";
import { useStepStore } from "../store/step";

interface Props {
  onSave: () => Promise<boolean>;
}

const WizardStepButton = ({ onSave }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { step, goPrev, goNext } = useStepStore();
  const isFilled = useNewsletterFormStore(
    useShallow((state) => ({
      name: Boolean(state.name),
      description: Boolean(state.description),
      send_frequency: Boolean(state.send_frequency),
      topics: Boolean(state.topics.length),
      sources: Boolean(state.sources.length),
      language: Boolean(state.language),
      send_time: Boolean(state.send_time),
      custom_prompt: Boolean(state.custom_prompt),
    })),
  );

  const validator = useMemo(() => STEPS[step].validator, [step]);
  const canProceed = validator ? validator(isFilled) : true;

  const NextButtonLabel = useMemo(() => {
    const labelGetter = STEPS[step].nextButtonLabelGetter;
    return labelGetter ? labelGetter(isFilled) : "Next";
  }, [step, isFilled.custom_prompt]);

  const save = useCallback(async () => {
    setIsLoading(true);
    const isSuccess = await onSave();
    if (!isSuccess) {
      setIsLoading(false);
    }
  }, []);

  return (
    <>
      {step > 0 ? <Button onPress={goPrev}>Prev</Button> : <div />}
      <Button
        onPress={step === STEPS.length - 1 ? save : goNext}
        color="primary"
        variant="solid"
        isDisabled={!canProceed}
        isLoading={isLoading}
      >
        {NextButtonLabel}
      </Button>
    </>
  );
};

export default WizardStepButton;
