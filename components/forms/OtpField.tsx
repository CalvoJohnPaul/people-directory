import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {PinInput} from '../ui/PinInput';

export interface OtpFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  placeholder?: string;
  className?: string;
}

export function OtpField(props: OtpFieldProps) {
  const [value, setValue] = useControllableState({
    prop: props.value,
    defaultProp: props.defaultValue ?? '',
    onChange: props.onChange,
  });

  const count = 6;
  const valueAsArray = Array.from({length: count}, (_, i) => value[i] || '');

  return (
    <PinInput.Root
      value={valueAsArray}
      onValueChange={(details) => {
        setValue(details.valueAsString);
      }}
      invalid={props.invalid}
      required={props.required}
      disabled={props.disabled}
      readOnly={props.readOnly}
      placeholder=""
      otp
      count={count}
      type="alphanumeric"
      className={props.className}
    >
      <PinInput.Control>
        {valueAsArray.map((_, i) => (
          <PinInput.Input key={i} index={i} />
        ))}
      </PinInput.Control>
    </PinInput.Root>
  );
}
