import {useControllableState} from '@radix-ui/react-use-controllable-state';
import {PasswordInput} from '../ui/PasswordInput';

export interface PasswordFieldProps {
  size?: 'md' | 'lg';
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

export function PasswordField(props: PasswordFieldProps) {
  const [value, setValue] = useControllableState({
    prop: props.value,
    defaultProp: props.defaultValue ?? '',
    onChange: props.onChange,
  });

  return (
    <PasswordInput.Root
      size={props.size}
      disabled={props.disabled}
      required={props.required}
      readOnly={props.readOnly}
      invalid={props.invalid}
      className={props.className}
      autoComplete="new-password"
    >
      <PasswordInput.Control>
        <PasswordInput.Input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          placeholder={props.placeholder || 'Enter password'}
          suppressHydrationWarning
        />
        <PasswordInput.VisibilityTrigger>
          <PasswordInput.Indicator />
        </PasswordInput.VisibilityTrigger>
      </PasswordInput.Control>
    </PasswordInput.Root>
  );
}
