import React, { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";

export function Form({ fields, onSubmit }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(
    Object.fromEntries(fields.map((f) => [f.name, ""])),
  );

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitField = () => {
    if (step < fields.length) {
      setStep(step + 1);
    } else {
      onSubmit(values);
    }
  };

  return (
    <Box flexDirection="column">
      {fields.map((field, index) => (
        <Box key={field.name}>
          <Text>{field.label}: </Text>
          <TextInput
            value={values[field.name]}
            onChange={(val) => handleChange(field.name, val)}
            onSubmit={handleSubmitField}
            focus={step === index}
          />
        </Box>
      ))}
      {step === fields.length && (
        <Box marginTop={1}>
          <Text color="green">[ Presiona Enter para enviar ]</Text>
          <TextInput value="" onSubmit={() => onSubmit(values)} focus />
          <Text color="red">[ Presiona R para limpiar ]</Text>
          <TextInput
            value=""
            onSubmit={() => {
              setValues(Object.fromEntries(fields.map((f) => [f.name, ""])));
              setStep(0);
            }}
            focus
          />
        </Box>
      )}
    </Box>
  );
}
